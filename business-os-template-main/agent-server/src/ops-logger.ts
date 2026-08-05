/**
 * Ops Logger — Central event bus for real-time agent observability.
 *
 * Collects tool calls, session events, errors, and system events
 * from the Agent SDK. Events are:
 *   1. Emitted via EventEmitter for local SSE consumers
 *   2. Persisted to Supabase (Mission Control) for production access
 */

import { EventEmitter } from 'events'
import { readEnvFile } from './env.js'

// ─── Event types ────────────────────────────────────────────────────────────

export type OpsEventType =
  | 'session_start'
  | 'session_compact'
  | 'tool_start'
  | 'tool_done'
  | 'tool_error'
  | 'agent_text'
  | 'agent_result'
  | 'agent_error'
  | 'cron_start'
  | 'cron_done'
  | 'cron_error'
  | 'stderr'
  | 'rate_limit'

export interface OpsEvent {
  id: string
  type: OpsEventType
  timestamp: number
  source: 'web' | 'cron' | 'system'
  sessionId?: string
  data: Record<string, unknown>
}

// ─── Supabase config ─────────────────────────────────────────────────────────

const env = readEnvFile(['MC_SUPABASE_URL', 'MC_SUPABASE_KEY'])
const SUPABASE_URL = env['MC_SUPABASE_URL'] ?? ''
const SUPABASE_KEY = env['MC_SUPABASE_KEY'] ?? ''

function persistToSupabase(event: OpsEvent): void {
  if (!SUPABASE_URL || !SUPABASE_KEY) return

  fetch(`${SUPABASE_URL}/rest/v1/ops_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      event_id: event.id,
      type: event.type,
      source: event.source,
      session_id: event.sessionId ?? null,
      data: event.data,
    }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {
    // Silent — don't break the event bus for a persistence failure
  })
}

// ─── Ring buffer for recent events ──────────────────────────────────────────

const MAX_BUFFER = 200

class OpsLogger extends EventEmitter {
  private buffer: OpsEvent[] = []
  private counter = 0

  emit(event: 'ops', payload: OpsEvent): boolean
  emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args)
  }

  log(type: OpsEventType, source: OpsEvent['source'], data: Record<string, unknown>, sessionId?: string): void {
    const event: OpsEvent = {
      id: `ops-${++this.counter}`,
      type,
      timestamp: Date.now(),
      source,
      sessionId,
      data,
    }

    this.buffer.push(event)
    if (this.buffer.length > MAX_BUFFER) {
      this.buffer = this.buffer.slice(-MAX_BUFFER)
    }

    this.emit('ops', event)
    persistToSupabase(event)
  }

  /** Get recent events (newest first) */
  getRecent(limit = 50): OpsEvent[] {
    return this.buffer.slice(-limit).reverse()
  }

  /** Get buffer size */
  get size(): number {
    return this.buffer.length
  }
}

// Singleton
export const opsLogger = new OpsLogger()
