import { query, type Query, type ModelInfo } from '@anthropic-ai/claude-agent-sdk'
import { PROJECT_ROOT, AGENT_TIMEOUT_MS } from './config.js'
import { logger } from './logger.js'
import { opsLogger } from './ops-logger.js'

export type { Query, ModelInfo }

// Track current model across queries (set from init + result events)
let currentModelId: string | null = null

// Track context window state
let contextWindowSize: number | null = null
let lastContextTokens: number | null = null

export function getCurrentModel(): string | null {
  return currentModelId
}

export function setCurrentModel(model: string): void {
  currentModelId = model
}

export function getContextInfo(): { used: number | null; total: number | null } {
  return { used: lastContextTokens, total: contextWindowSize }
}

export interface AgentResult {
  text: string | null
  newSessionId?: string
  slashCommands?: string[]
  isCompact?: boolean
  tokensBefore?: number
  tokensAfter?: number
}

// ─── SSE Stream Events ────────────────────────────────────────────────────────

export type SSEEvent =
  | { type: 'init'; sessionId: string; slashCommands?: string[] }
  | { type: 'text_delta'; text: string }
  | { type: 'tool_start'; toolName: string; toolId: string }
  | { type: 'tool_done'; toolId: string }
  | { type: 'compact'; tokensBefore?: number; tokensAfter?: number }
  | { type: 'usage'; costUsd: number; inputTokens: number; outputTokens: number; durationMs: number; numTurns: number; model?: string; contextUsed?: number; contextTotal?: number }
  | { type: 'result'; text: string }
  | { type: 'model_changed'; model: string }
  | { type: 'interrupt' }
  | { type: 'error'; message: string }

/**
 * Streaming version of runAgent. Yields SSE events as the agent works.
 * Uses includePartialMessages to get real-time text + tool call visibility.
 */
export type EffortLevel = 'low' | 'medium' | 'high' | 'max'

export type OpsSource = 'web' | 'cron' | 'system'

export async function* runAgentStream(
  message: string,
  sessionId?: string,
  signal?: AbortSignal,
  effort?: EffortLevel,
  onQuery?: (q: Query) => void,
  source: OpsSource = 'web',
): AsyncGenerator<SSEEvent> {
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), AGENT_TIMEOUT_MS)

  // Link external signal to our abort controller
  if (signal) {
    signal.addEventListener('abort', () => ac.abort(), { once: true })
  }

  let resultText = ''
  let inTool = false
  let currentToolId: string | null = null
  let currentToolName: string | null = null
  let toolStartTime = 0
  let streamSessionId: string | undefined
  let lastTurnInputTokens: number | null = null
  const seenAssistantIds = new Set<string>()

  try {
    const stream = query({
      prompt: message,
      options: {
        cwd: PROJECT_ROOT,
        resume: sessionId,
        settingSources: ['project', 'user'],
        permissionMode: 'bypassPermissions',
        abortController: ac,
        includePartialMessages: true,
        env: process.env as Record<string, string>,
        ...(effort && { effort }),
        ...(currentModelId && { model: currentModelId }),
      },
    })

    // Expose Query object to caller for interrupt/setModel/etc.
    onQuery?.(stream)

    for await (const event of stream) {
      const e = event as Record<string, unknown>

      // System init
      if (e['type'] === 'system' && e['subtype'] === 'init') {
        if (e['model']) currentModelId = e['model'] as string
        streamSessionId = e['session_id'] as string
        opsLogger.log('session_start', source, {
          model: currentModelId,
          prompt: message.slice(0, 200),
        }, streamSessionId)
        yield {
          type: 'init',
          sessionId: streamSessionId,
          slashCommands: e['slash_commands'] as string[] | undefined,
        }
      }

      // Compact boundary (SDK only provides pre_tokens; post-compact size comes from next assistant message)
      if (e['type'] === 'system' && e['subtype'] === 'compact_boundary') {
        const meta = e['compact_metadata'] as Record<string, unknown> | undefined
        const preTokens = meta?.['pre_tokens'] as number | undefined
        // Reset tracking so the next assistant message gives us post-compact context size
        lastTurnInputTokens = null
        seenAssistantIds.clear()
        opsLogger.log('session_compact', source, {
          tokensBefore: preTokens,
        }, streamSessionId)
        yield {
          type: 'compact',
          tokensBefore: preTokens,
        }
      }

      // Assistant messages carry per-turn usage (= real context size for that turn)
      // Total context = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
      // Deduplicate by message ID (parallel tool calls share the same ID)
      if (e['type'] === 'assistant') {
        const msg = e['message'] as { id?: string; usage?: Record<string, number> } | undefined
        const msgId = msg?.id
        const usage = msg?.usage
        if (msgId && usage && !seenAssistantIds.has(msgId)) {
          seenAssistantIds.add(msgId)
          const totalContext = (usage['input_tokens'] ?? 0)
            + (usage['cache_creation_input_tokens'] ?? 0)
            + (usage['cache_read_input_tokens'] ?? 0)
          if (totalContext > 0) lastTurnInputTokens = totalContext
        }
      }

      // Stream events (partial messages)
      if (e['type'] === 'stream_event') {
        const ev = e['event'] as Record<string, unknown>
        const evType = ev['type'] as string

        if (evType === 'content_block_start') {
          const block = ev['content_block'] as Record<string, unknown>
          if (block?.['type'] === 'tool_use') {
            const toolName = block['name'] as string
            const toolId = block['id'] as string
            inTool = true
            currentToolId = toolId
            currentToolName = toolName
            toolStartTime = Date.now()
            opsLogger.log('tool_start', source, { toolName, toolId }, streamSessionId)
            yield { type: 'tool_start', toolName, toolId }
          }
        }

        if (evType === 'content_block_delta') {
          const delta = ev['delta'] as Record<string, unknown>
          if (delta?.['type'] === 'text_delta' && !inTool) {
            const text = delta['text'] as string
            resultText += text
            yield { type: 'text_delta', text }
          }
        }

        if (evType === 'content_block_stop') {
          if (inTool && currentToolId) {
            const elapsed = Date.now() - toolStartTime
            opsLogger.log('tool_done', source, {
              toolName: currentToolName,
              toolId: currentToolId,
              durationMs: elapsed,
            }, streamSessionId)
            yield { type: 'tool_done', toolId: currentToolId }
            inTool = false
            currentToolId = null
            currentToolName = null
          }
        }
      }

      // Result message with usage data
      if (e['type'] === 'result') {
        const raw = e['result']
        if (typeof raw === 'string') {
          resultText = raw
        } else if (raw && typeof raw === 'object' && 'result' in raw) {
          resultText = (raw as { result: string }).result
        }

        // Extract model + context window from modelUsage (authoritative source)
        const modelUsage = e['modelUsage'] as Record<string, Record<string, unknown>> | undefined
        if (modelUsage) {
          const models = Object.keys(modelUsage)
          if (models.length > 0) {
            currentModelId = models[0]
            const info = modelUsage[models[0]]
            if (typeof info?.['contextWindow'] === 'number') {
              contextWindowSize = info['contextWindow'] as number
            }
          }
        }
        // Fallback: default to 200K if SDK didn't provide contextWindow
        if (contextWindowSize == null) contextWindowSize = 200_000

        // Extract usage data from result message
        const costUsd = (e['total_cost_usd'] as number) ?? 0
        const usage = (e['usage'] as Record<string, number>) ?? {}
        const durationMs = (e['duration_ms'] as number) ?? 0
        const numTurns = (e['num_turns'] as number) ?? 0

        // Use last assistant message's total context as real context size
        if (lastTurnInputTokens != null) {
          lastContextTokens = lastTurnInputTokens
        }

        opsLogger.log('agent_result', source, {
          costUsd,
          inputTokens: usage['input_tokens'] ?? 0,
          outputTokens: usage['output_tokens'] ?? 0,
          durationMs,
          numTurns,
          model: currentModelId,
          resultLength: resultText.length,
        }, streamSessionId)

        yield {
          type: 'usage',
          costUsd,
          inputTokens: usage['input_tokens'] ?? 0,
          outputTokens: usage['output_tokens'] ?? 0,
          durationMs,
          numTurns,
          model: currentModelId ?? undefined,
          contextUsed: lastContextTokens ?? undefined,
          contextTotal: contextWindowSize ?? undefined,
        }

        yield { type: 'result', text: resultText }
      }
    }
  } catch (err) {
    logger.error({ err }, 'runAgentStream error')
    const msg = String(err)
    opsLogger.log('agent_error', source, { error: msg }, streamSessionId)
    if (ac.signal.aborted || msg.includes('abort')) {
      yield { type: 'error', message: 'Aborted.' }
    } else {
      yield { type: 'error', message: msg }
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Spawns the real `claude` CLI as a subprocess via Agent SDK.
 *
 * Key: bypassPermissions = no approval prompts → the bot won't hang.
 * settingSources ['project','user'] = loads CLAUDE.md from this dir + global skills from ~/.claude/
 * resume = continues the previous session (native Claude Code conversation memory)
 */
export async function runAgent(
  message: string,
  sessionId?: string,
  onTyping?: () => void,
  source: OpsSource = 'web',
): Promise<AgentResult> {
  let resultText: string | null = null
  let newSessionId: string | undefined
  let slashCommands: string[] | undefined
  let isCompact = false
  let tokensBefore: number | undefined
  let tokensAfter: number | undefined

  const typingInterval = onTyping ? setInterval(onTyping, 4000) : null
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), AGENT_TIMEOUT_MS)

  try {
    const stream = query({
      prompt: message,
      options: {
        cwd: PROJECT_ROOT,
        resume: sessionId,
        settingSources: ['project', 'user'],
        permissionMode: 'bypassPermissions',
        abortController: ac,
        env: process.env as Record<string, string>,
        ...(currentModelId && { model: currentModelId }),
      },
    })

    for await (const event of stream) {
      const e = event as Record<string, unknown>

      if (e['type'] === 'system' && e['subtype'] === 'init') {
        newSessionId = e['session_id'] as string | undefined
        slashCommands = e['slash_commands'] as string[] | undefined
        if (e['model']) currentModelId = e['model'] as string
        opsLogger.log('session_start', source, {
          model: currentModelId,
          prompt: message.slice(0, 200),
        }, newSessionId)
      }

      if (e['type'] === 'system' && e['subtype'] === 'compact_boundary') {
        isCompact = true
        const meta = e['compact_metadata'] as Record<string, unknown> | undefined
        if (meta) {
          tokensBefore = meta['pre_tokens'] as number | undefined
        }
        opsLogger.log('session_compact', source, { tokensBefore }, newSessionId)
      }

      // Track last assistant message's total context (input + cache tokens)
      if (e['type'] === 'assistant') {
        const msg = e['message'] as { usage?: Record<string, number> } | undefined
        const usage = msg?.usage
        if (usage) {
          const totalContext = (usage['input_tokens'] ?? 0)
            + (usage['cache_creation_input_tokens'] ?? 0)
            + (usage['cache_read_input_tokens'] ?? 0)
          if (totalContext > 0) lastContextTokens = totalContext
        }
      }

      if (e['type'] === 'result') {
        const mu = e['modelUsage'] as Record<string, Record<string, unknown>> | undefined
        if (mu) {
          const models = Object.keys(mu)
          if (models.length > 0) {
            currentModelId = models[0]
            const info = mu[models[0]]
            if (typeof info?.['contextWindow'] === 'number') contextWindowSize = info['contextWindow'] as number
          }
        }
        if (contextWindowSize == null) contextWindowSize = 200_000

        const raw = e['result']
        if (typeof raw === 'string') {
          resultText = raw
        } else if (raw && typeof raw === 'object' && 'result' in raw) {
          resultText = (raw as { result: string }).result
        }

        const costUsd = (e['total_cost_usd'] as number) ?? 0
        const usage = (e['usage'] as Record<string, number>) ?? {}
        const durationMs = (e['duration_ms'] as number) ?? 0
        const numTurns = (e['num_turns'] as number) ?? 0

        opsLogger.log('agent_result', source, {
          costUsd,
          inputTokens: usage['input_tokens'] ?? 0,
          outputTokens: usage['output_tokens'] ?? 0,
          durationMs,
          numTurns,
          model: currentModelId,
          resultLength: resultText?.length ?? 0,
        }, newSessionId)
      }
    }
  } catch (err) {
    logger.error({ err }, 'runAgent error')
    const msg = String(err)
    opsLogger.log('agent_error', source, { error: msg }, newSessionId)
    if (ac.signal.aborted || msg.includes('abort')) {
      throw new Error('Took too long thinking. Try again with a shorter message or use /newchat.')
    }
    if (msg.includes('timeout') || msg.includes('Timeout')) {
      throw new Error('Response timed out. Try again.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
    if (typingInterval) clearInterval(typingInterval)
  }

  logger.debug({ sessionId, newSessionId, length: resultText?.length, isCompact }, 'runAgent complete')
  return { text: resultText, newSessionId, slashCommands, isCompact, tokensBefore, tokensAfter }
}

/**
 * Get available models from the SDK. Creates a temporary query to call supportedModels(),
 * then immediately interrupts to avoid executing any prompt.
 */
export async function getAvailableModels(sessionId?: string): Promise<ModelInfo[]> {
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 30_000)

  try {
    const stream = query({
      prompt: '/status',
      options: {
        cwd: PROJECT_ROOT,
        ...(sessionId && { resume: sessionId }),
        settingSources: ['project', 'user'],
        permissionMode: 'bypassPermissions',
        abortController: ac,
      },
    })

    const models = await stream.supportedModels()
    await stream.interrupt()
    return models
  } catch (err) {
    logger.error({ err }, 'getAvailableModels error')
    return []
  } finally {
    clearTimeout(timeout)
  }
}
