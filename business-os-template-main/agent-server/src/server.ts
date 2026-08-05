/**
 * Mission Control Web Server — exposes a local HTTP endpoint so Mission Control
 * dashboard can send messages to the Agent (Claude Code Agent SDK) from the browser.
 *
 * Endpoints:
 *   POST /chat            { message: string } → { text: string }
 *   POST /chat/stream     { message: string } → SSE stream
 *   POST /chat/interrupt  {}                  → gracefully stop active query
 *   POST /newchat         {}                  → { ok: true }
 *   GET  /commands         → available slash commands
 *   GET  /models           → available AI models
 *   GET  /usage?days=30    → usage summary (tokens, cost)
 *   GET  /schedule         → list cron jobs
 *   POST /schedule/:id/:action → run/pause/resume a cron job
 *   GET  /ops/stream       → SSE stream of real-time agent activity
 *   GET  /ops/recent       → snapshot of recent events (JSON)
 *
 * Auth: Bearer token (OPENCLAW_GATEWAY_TOKEN)
 * Port: MC_SERVER_PORT env var, default 3099
 */

import { createServer, IncomingMessage, ServerResponse } from 'http'
import { timingSafeEqual } from 'crypto'
import { readEnvFile } from './env.js'
import { PROJECT_ROOT } from './config.js'
import { runAgent, runAgentStream, getAvailableModels, getCurrentModel, setCurrentModel, getContextInfo, EffortLevel, type Query } from './agent.js'
import { downloadFromUrl, buildPhotoMessage } from './media.js'
import { getSession, setSession, clearSession, listTasks, getTask, updateTaskStatus, updateTaskAfterRun, saveQueryUsage, getUsageSummary } from './db.js'
import { computeNextRun, runDueTasks } from './scheduler.js'
import { buildMemoryContext, saveConversationTurn } from './memory.js'
import { logger } from './logger.js'
import { validateInput, validateUrl, redactSecrets, MAX_DOWNLOAD_SIZE } from './security.js'
import { opsLogger, type OpsEvent } from './ops-logger.js'

// ─── Status helpers ──────────────────────────────────────────────────────────

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-opus-4-6': 'Claude Opus 4.6',
  'claude-sonnet-4-6': 'Claude Sonnet 4.6',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
}

const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${Math.round(n / 1_000)}K`
  : String(n)

function cronToHuman(cron: string): string {
  const parts = cron.split(/\s+/)
  if (parts.length < 5) return cron
  const [min, hour, dom, , dow] = parts
  const pad = (s: string) => s.padStart(2, '0')

  if (hour.startsWith('*/')) return `every ${hour.slice(2)}h`
  if (min.startsWith('*/')) return `every ${min.slice(2)}min`

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  if (dow !== '*') return `${days[parseInt(dow)] ?? dow} ${pad(hour)}:${pad(min)}`
  if (dom !== '*') return `day ${dom} of month ${pad(hour)}:${pad(min)}`

  return `${pad(hour)}:${pad(min)} daily`
}

function buildStatusText(): string {
  const model = getCurrentModel()
  const modelDisplay = model ? MODEL_DISPLAY_NAMES[model] ?? model : null
  const ctx = getContextInfo()
  const cronJobs = listTasks().filter(t => t.status === 'active')

  let s = '**Agent Status**\n\n'

  // Model
  if (modelDisplay && model) {
    s += `**Model:** ${modelDisplay} (\`${model}\`)\n`
  } else if (model) {
    s += `**Model:** \`${model}\`\n`
  } else {
    s += '**Model:** no data (send a message first)\n'
  }

  // Context window
  if (ctx.used != null && ctx.total != null) {
    const free = ctx.total - ctx.used
    const pctFree = Math.round((free / ctx.total) * 100)
    s += `**Context:** ~${fmtTokens(ctx.used)} / ${fmtTokens(ctx.total)} tokens (${pctFree}% free)\n`
  } else if (ctx.used != null) {
    s += `**Context:** ~${fmtTokens(ctx.used)} tokens used\n`
  } else {
    s += '**Context:** no data\n'
  }
  s += '\n'

  // Cron jobs
  s += `**${cronJobs.length} Active Cron Jobs:**\n`
  cronJobs.forEach((cron, i) => {
    const sched = cronToHuman(cron.schedule)
    s += `${i + 1}. ${cron.id} — ${sched}\n`
  })

  // Last completed cron
  const lastRun = listTasks()
    .filter(t => t.last_run)
    .sort((a, b) => (b.last_run ?? 0) - (a.last_run ?? 0))[0]
  if (lastRun) {
    const snippet = lastRun.last_result
      ? lastRun.last_result.slice(0, 80).replace(/\n/g, ' ')
      : 'no result'
    s += `\n**Last job:** ${lastRun.id} → ${snippet}${(lastRun.last_result?.length ?? 0) > 80 ? '...' : ''}`
  }

  return s
}

// ─── Config ──────────────────────────────────────────────────────────────────

const env = readEnvFile(['OPENCLAW_GATEWAY_TOKEN', 'MC_SERVER_PORT', 'MISSION_CONTROL_ORIGIN'])
const MC_TOKEN = env['OPENCLAW_GATEWAY_TOKEN'] ?? ''
const PORT = parseInt(env['MC_SERVER_PORT'] ?? '3099', 10)
const ALLOWED_ORIGIN = env['MISSION_CONTROL_ORIGIN'] ?? ''

if (!MC_TOKEN) {
  console.error('FATAL: OPENCLAW_GATEWAY_TOKEN is not set. Server will reject all requests.')
}

function isTokenValid(provided: string): boolean {
  if (!MC_TOKEN) return false
  if (provided.length !== MC_TOKEN.length) return false
  return timingSafeEqual(Buffer.from(provided), Buffer.from(MC_TOKEN))
}

// Separate session key for web chat (different from Telegram session)
const SESSION_KEY = 'mc-web'

// Active query reference for interrupt support
let activeQuery: Query | null = null
let activeStream: { interrupted: boolean; clientConnected: boolean } | null = null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setCORSHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function sendJSON(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
  })
}

// ─── Request handler ─────────────────────────────────────────────────────────

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  setCORSHeaders(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Auth
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '')
  if (!isTokenValid(token)) {
    sendJSON(res, 401, { error: 'Unauthorized' })
    return
  }

  const body = await readBody(req)
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(body) } catch { /* ignore */ }

  // GET /models — return available models (hardcoded + SDK fallback)
  if (req.method === 'GET' && req.url === '/models') {
    const MODELS = [
      { value: 'claude-opus-4-6',           displayName: 'Opus 4.6',   description: 'Most capable. Agents and code.',    supportsEffort: true },
      { value: 'claude-sonnet-4-6',         displayName: 'Sonnet 4.6', description: 'Balance of speed + intelligence.', supportsEffort: true },
      { value: 'claude-haiku-4-5-20251001', displayName: 'Haiku 4.5',  description: 'Fastest. Light tasks.',            supportsEffort: true },
    ]

    // Try SDK models first, fallback to hardcoded
    try {
      const sessionId = getSession(SESSION_KEY)
      const sdkModels = await getAvailableModels(sessionId)
      sendJSON(res, 200, { models: sdkModels.length > 0 ? sdkModels : MODELS })
    } catch {
      sendJSON(res, 200, { models: MODELS })
    }
    return
  }

  // POST /chat/interrupt — gracefully interrupt the active query
  if (req.method === 'POST' && req.url === '/chat/interrupt') {
    if (activeStream) activeStream.interrupted = true
    if (activeQuery) {
      try {
        await activeQuery.interrupt()
        activeQuery = null
        sendJSON(res, 200, { ok: true })
      } catch (err) {
        logger.error({ err }, 'interrupt error')
        activeQuery = null
        sendJSON(res, 200, { ok: true, message: 'Interrupt attempted' })
      }
    } else {
      sendJSON(res, 200, { ok: true, message: 'No active query' })
    }
    return
  }

  // GET /commands — return available slash commands
  if (req.method === 'GET' && req.url === '/commands') {
    sendJSON(res, 200, {
      commands: [
        { name: '/clear',   description: 'New conversation — clear history' },
        { name: '/compact', description: 'Compress context (reduce token usage)' },
        { name: '/status',  description: 'Agent status: model, active tasks, session' },
        { name: '/tasks',   description: 'Current tasks on the Kanban board' },
        { name: '/agents',  description: 'Live status of all agents' },
        { name: '/context', description: 'Current context usage (tokens)' },
        { name: '/model',   description: 'Switch AI model' },
        { name: '/help',    description: 'Show all available commands' },
      ],
    })
    return
  }

  // POST /newchat — reset Claude Code session
  if (req.method === 'POST' && req.url === '/newchat') {
    clearSession(SESSION_KEY)
    sendJSON(res, 200, { ok: true })
    return
  }

  // POST /chat/stream — SSE streaming endpoint for real-time chat
  if (req.method === 'POST' && req.url === '/chat/stream') {
    let message = typeof parsed['message'] === 'string' ? parsed['message'].trim() : ''
    if (!message) {
      sendJSON(res, 400, { error: 'message required' })
      return
    }

    // Intercept /model <name> — change model without sending to agent
    const modelMatch = message.match(/^\/model\s+(.+)$/i)
    if (modelMatch) {
      const modelName = modelMatch[1].trim()
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })

      try {
        // Just update the in-memory model preference.
        // runAgentStream/runAgent now pass `model` in query options,
        // so the next message will use this model.
        setCurrentModel(modelName)
        const display = MODEL_DISPLAY_NAMES[modelName] ?? modelName
        res.write(`data: ${JSON.stringify({ type: 'model_changed', model: modelName })}\n\n`)
        res.write(`data: ${JSON.stringify({ type: 'text_delta', text: `Model changed to **${display}**. The next message will use this model.` })}\n\n`)
      } catch (err) {
        logger.error({ err }, 'setModel error')
        res.write(`data: ${JSON.stringify({ type: 'error', message: `Failed to switch model: ${String(err)}` })}\n\n`)
      } finally {
        res.write('data: [DONE]\n\n')
        res.end()
      }
      return
    }

    // Intercept /status — build from real data, no agent call needed
    if (message === '/status') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      })

      try {
        const status = buildStatusText()
        res.write(`data: ${JSON.stringify({ type: 'text_delta', text: status })}\n\n`)
        res.write(`data: ${JSON.stringify({ type: 'result', text: status })}\n\n`)
      } catch (err) {
        logger.error({ err }, 'status build error')
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Error generating status' })}\n\n`)
      } finally {
        res.write('data: [DONE]\n\n')
        res.end()
      }
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })

    // Cancel any existing background query
    if (activeStream) activeStream.interrupted = true
    if (activeQuery) {
      try { await activeQuery.interrupt() } catch { /* ignore */ }
      activeQuery = null
    }

    // Input validation (logs suspicious patterns, truncates if too long)
    message = validateInput(message, 'web-chat')

    const stream = { interrupted: false, clientConnected: true }
    activeStream = stream
    const chatSessionId = typeof parsed['chatSessionId'] === 'string' ? parsed['chatSessionId'] : null
    const audioUrl = typeof parsed['audioUrl'] === 'string' ? parsed['audioUrl'] : null
    const imageUrl = typeof parsed['imageUrl'] === 'string' ? parsed['imageUrl'] : null
    const context = typeof parsed['context'] === 'string' ? parsed['context'] : null

    const ac = new AbortController()
    // Safety timeout — 10 min hard limit
    const safetyTimeout = setTimeout(() => {
      if (activeQuery) {
        activeQuery.interrupt().catch(() => ac.abort())
      } else {
        ac.abort()
      }
    }, 600_000)
    // Track client disconnect — don't abort agent, let it finish in background
    req.on('close', () => { stream.clientConnected = false })
    res.on('error', () => { stream.clientConnected = false })

    try {
      const sessionId = getSession(SESSION_KEY)

      // If user sent images, download to local filesystem so Claude Code can Read them
      // imageUrl can contain multiple URLs separated by newline
      let imagePrefix = ''
      if (imageUrl) {
        const urls = imageUrl.split('\n').filter((u: string) => u.startsWith('http'))
        for (const url of urls) {
          const urlError = validateUrl(url)
          if (urlError) {
            logger.warn({ url: url.slice(0, 100), reason: urlError }, 'blocked image download')
            continue
          }
          try {
            const localPath = await downloadFromUrl(url)
            imagePrefix += buildPhotoMessage(localPath) + '\n\n'
          } catch (err) {
            logger.error({ err, url }, 'failed to download user image')
          }
        }
      }

      const isCompactCmd = message === '/compact'

      // Slash commands like /compact must reach the SDK as-is (no memory context wrapping)
      const memCtx = isCompactCmd ? null : await buildMemoryContext(SESSION_KEY, message)
      const contextPrefix = context && !isCompactCmd ? `[Context: ${context}]\n\n` : ''
      const fullMessage = isCompactCmd ? message : contextPrefix + imagePrefix + (memCtx ? `${memCtx}\n\n${message}` : message)

      const effort = typeof parsed['effort'] === 'string'
        ? (['low', 'medium', 'high', 'max'].includes(parsed['effort']) ? parsed['effort'] as EffortLevel : undefined)
        : undefined

      let newSessionId: string | undefined
      let resultText = ''

      for await (const event of runAgentStream(fullMessage, sessionId, ac.signal, effort, (q) => {
        activeQuery = q
      })) {
        if (ac.signal.aborted) break

        // Capture session ID for persistence
        if (event.type === 'init') {
          newSessionId = event.sessionId
        }
        if (event.type === 'result') {
          resultText = event.text
        }

        // Save usage data to SQLite
        if (event.type === 'usage') {
          saveQueryUsage({
            sessionKey: SESSION_KEY,
            costUsd: event.costUsd,
            inputTokens: event.inputTokens,
            outputTokens: event.outputTokens,
            durationMs: event.durationMs,
            numTurns: event.numTurns,
          })
        }

        if (stream.clientConnected) {
          try { res.write(`data: ${JSON.stringify(event)}\n\n`) } catch { stream.clientConnected = false }
        }
      }

      // After /compact, append full status (context info is fresh from compact_boundary)
      if (isCompactCmd && stream.clientConnected) {
        try {
          const statusText = buildStatusText()
          const combined = resultText.trim()
            ? resultText.trim() + '\n\n---\n\n' + statusText
            : statusText
          resultText = combined
          res.write(`data: ${JSON.stringify({ type: 'result', text: combined })}\n\n`)
        } catch { /* status append is best-effort */ }
      }

      // Persist session and memory (always, regardless of client state)
      if (newSessionId) setSession(SESSION_KEY, newSessionId)
      if (resultText.trim()) {
        await saveConversationTurn(SESSION_KEY, message, resultText.trim())
      }

      // Background completion: client left during processing, save to MC + push
      if (!stream.clientConnected && !stream.interrupted && resultText.trim() && ALLOWED_ORIGIN) {
        fetch(`${ALLOWED_ORIGIN}/api/chat/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MC_TOKEN}`,
          },
          body: JSON.stringify({
            chatSessionId,
            userMessage: message,
            assistantMessage: resultText.trim(),
            audioUrl,
          }),
        }).catch((err) => logger.error({ err }, 'background completion save failed'))
      }
    } catch (err) {
      logger.error({ err }, 'server /chat/stream error')
      if (stream.clientConnected) {
        try { res.write(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`) } catch { /* */ }
      }
    } finally {
      clearTimeout(safetyTimeout)
      activeQuery = null
      if (activeStream === stream) activeStream = null
      if (stream.clientConnected) {
        try {
          res.write('data: [DONE]\n\n')
          res.end()
        } catch { /* client already gone */ }
      }
    }
    return
  }

  // POST /chat — run agent and return response (legacy, used by Telegram)
  if (req.method === 'POST' && req.url === '/chat') {
    let message = typeof parsed['message'] === 'string' ? parsed['message'].trim() : ''
    if (!message) {
      sendJSON(res, 400, { error: 'message required' })
      return
    }
    message = validateInput(message, 'web-chat-legacy')

    try {
      const sessionId = getSession(SESSION_KEY)
      const memCtx = await buildMemoryContext(SESSION_KEY, message)
      const fullMessage = memCtx ? `${memCtx}\n\n${message}` : message

      const result = await runAgent(fullMessage, sessionId)

      if (result.newSessionId) {
        setSession(SESSION_KEY, result.newSessionId)
      }

      const responseText = result.text?.trim() ?? ''
      if (responseText) {
        await saveConversationTurn(SESSION_KEY, message, responseText)
      }

      sendJSON(res, 200, {
        text: responseText,
        ...(result.slashCommands && { slashCommands: result.slashCommands }),
        ...(result.isCompact && {
          compact: {
            tokensBefore: result.tokensBefore,
            tokensAfter: result.tokensAfter,
          },
        }),
      })
    } catch (err) {
      logger.error({ err }, 'server /chat error')
      sendJSON(res, 500, { error: String(err) })
    }
    return
  }

  // GET /usage — usage summary (tokens, cost, queries)
  if (req.method === 'GET' && req.url?.startsWith('/usage')) {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const days = parseInt(url.searchParams.get('days') ?? '30', 10)
    const sinceMs = Date.now() - 86_400_000 * days
    sendJSON(res, 200, getUsageSummary(sinceMs))
    return
  }

  // GET /schedule — list all cron jobs
  if (req.method === 'GET' && req.url === '/schedule') {
    sendJSON(res, 200, { tasks: listTasks() })
    return
  }

  // POST /schedule/:id/:action — run/pause/resume a cron job
  const scheduleMatch = req.url?.match(/^\/schedule\/([^/]+)\/(run|pause|resume)$/)
  if (req.method === 'POST' && scheduleMatch) {
    const [, taskId, action] = scheduleMatch
    const task = getTask(taskId)
    if (!task) {
      sendJSON(res, 404, { error: `Task "${taskId}" not found` })
      return
    }

    if (action === 'pause') {
      updateTaskStatus(taskId, 'paused')
      sendJSON(res, 200, { ok: true })
      return
    }

    if (action === 'resume') {
      const nextRun = computeNextRun(task.schedule)
      updateTaskStatus(taskId, 'active')
      updateTaskAfterRun(taskId, task.last_result ?? '', nextRun)
      sendJSON(res, 200, { ok: true, nextRun })
      return
    }

    // action === 'run' — execute async, return 202 immediately
    sendJSON(res, 202, { ok: true, message: `Task "${taskId}" queued for execution` })
    runAgent(task.prompt)
      .then((result) => {
        const text = result.text?.trim() ?? ''
        const nextRun = computeNextRun(task.schedule)
        updateTaskAfterRun(taskId, text || '(no output)', nextRun)
        logger.info({ taskId }, 'manual run completed')
      })
      .catch((err) => {
        const nextRun = computeNextRun(task.schedule)
        updateTaskAfterRun(taskId, `Error: ${String(err)}`, nextRun)
        logger.error({ err, taskId }, 'manual run error')
      })
    return
  }

  // GET /ops/stream — SSE stream of real-time agent activity
  if (req.method === 'GET' && req.url === '/ops/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })

    // Send recent events as initial burst
    const recent = opsLogger.getRecent(50)
    for (const event of recent.reverse()) {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }

    // Stream new events as they arrive
    let connected = true
    const onEvent = (event: OpsEvent) => {
      if (!connected) return
      try { res.write(`data: ${JSON.stringify(event)}\n\n`) } catch { connected = false }
    }

    opsLogger.on('ops', onEvent)

    // Keep-alive ping every 30s
    const keepAlive = setInterval(() => {
      if (!connected) return
      try { res.write(': ping\n\n') } catch { connected = false }
    }, 30_000)

    req.on('close', () => {
      connected = false
      opsLogger.off('ops', onEvent)
      clearInterval(keepAlive)
    })
    return
  }

  // GET /ops/recent — snapshot of recent events (JSON)
  if (req.method === 'GET' && req.url?.startsWith('/ops/recent')) {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200)
    sendJSON(res, 200, { events: opsLogger.getRecent(limit) })
    return
  }

  sendJSON(res, 404, { error: 'Not found' })
}

// ─── Start server ─────────────────────────────────────────────────────────────

export function startMCServer(): void {
  const server = createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      logger.error({ err }, 'server unhandled error')
      try {
        sendJSON(res, 500, { error: 'Internal server error' })
      } catch { /* headers already sent */ }
    })
  })

  server.listen(PORT, '127.0.0.1', () => {
    logger.info({ port: PORT }, 'MC web server listening on localhost')
    console.log(`✓ MC server on http://localhost:${PORT}`)
  })
}
