/**
 * Mission Control client — Agent Server → Mission Control webhook.
 * Fires start/end/error events so every conversation
 * appears as a task on the Kanban board in real time.
 */

import { readEnvFile } from './env.js'

const _env = readEnvFile(['MISSION_CONTROL_URL', 'MISSION_CONTROL_TOKEN'])
const MC_URL = _env['MISSION_CONTROL_URL'] ?? ''
const MC_TOKEN = _env['MISSION_CONTROL_TOKEN'] ?? ''

async function postEvent(payload: Record<string, unknown>): Promise<void> {
  if (!MC_TOKEN) return // No token configured — skip silently
  try {
    await fetch(MC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MC_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    // Mission Control offline or unreachable — silently skip, never block the bot
  }
}

export function mcStart(runId: string, prompt: string, source: string): void {
  void postEvent({
    runId,
    action: 'start',
    agentId: 'assistant',
    prompt,
    source,
    timestamp: new Date().toISOString(),
  })
}

export function mcEnd(runId: string, response: string): void {
  void postEvent({
    runId,
    action: 'end',
    agentId: 'assistant',
    response,
    timestamp: new Date().toISOString(),
  })
}

export function mcError(runId: string, error: string): void {
  void postEvent({
    runId,
    action: 'error',
    agentId: 'assistant',
    error,
    timestamp: new Date().toISOString(),
  })
}

export function mcCronResult(jobId: string, output: string, error?: string): Promise<void> {
  const payload: Record<string, unknown> = {
    action: 'end',
    runId: `cron-${jobId}-${Date.now()}`,
    agentId: 'assistant',
    prompt: jobId,
    response: output,
    source: 'cron',
    timestamp: new Date().toISOString(),
  }
  if (error) payload.error = error
  return postEvent(payload)
}
