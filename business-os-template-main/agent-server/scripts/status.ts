#!/usr/bin/env node
/**
 * Health check for Agent Server.
 * Uso: npx tsx scripts/status.ts
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

// Cargar .env
const envFile = join(ROOT, '.env')
const env: Record<string, string> = {}

if (existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = value
  }
}

function check(label: string, ok: boolean, detail?: string): void {
  const icon = ok ? '✓' : '✗'
  const line = detail ? `${icon} ${label}: ${detail}` : `${icon} ${label}`
  console.log(ok ? `\x1b[32m${line}\x1b[0m` : `\x1b[31m${line}\x1b[0m`)
}

console.log('\n─── Agent Server Status ───\n')

// PID file
const pidFile = join(ROOT, 'store', 'agent-server.pid')
let isRunning = false
if (existsSync(pidFile)) {
  const pid = readFileSync(pidFile, 'utf8').trim()
  try {
    process.kill(parseInt(pid, 10), 0)
    isRunning = true
    check('Process', true, `PID ${pid}`)
  } catch {
    check('Process', false, `stale PID ${pid}`)
  }
} else {
  check('Process', false, 'not running (no PID file)')
}

// DB
const dbFile = join(ROOT, 'store', 'agent-server.db')
check('Database', existsSync(dbFile), existsSync(dbFile) ? dbFile : 'not found')

// .env
check('.env file', existsSync(envFile))

// Required env vars
check('TELEGRAM_BOT_TOKEN', Boolean(env['TELEGRAM_BOT_TOKEN']), env['TELEGRAM_BOT_TOKEN'] ? '***' : 'MISSING')
check('ALLOWED_CHAT_ID', Boolean(env['ALLOWED_CHAT_ID']), env['ALLOWED_CHAT_ID'] || 'MISSING')

// Optional env vars
check('GROQ_API_KEY (STT)', Boolean(env['GROQ_API_KEY']), env['GROQ_API_KEY'] ? '✓ set' : 'not set (STT disabled)')
check('ELEVENLABS_API_KEY (TTS)', Boolean(env['ELEVENLABS_API_KEY']), env['ELEVENLABS_API_KEY'] ? '✓ set' : 'not set (TTS disabled)')
check('ANALYTICS_SUPABASE_KEY', Boolean(env['ANALYTICS_SUPABASE_KEY']), env['ANALYTICS_SUPABASE_KEY'] ? '✓ set' : 'not set (optional)')

// launchd
try {
  const { execSync } = await import('child_process')
  const output = execSync('launchctl list com.agent-server.app 2>/dev/null || echo "not loaded"', { encoding: 'utf8' })
  check('launchd service', !output.includes('not loaded'), output.trim().split('\n')[0])
} catch {
  check('launchd service', false, 'check failed')
}

// dist/
const distIndex = join(ROOT, 'dist', 'index.js')
check('Build (dist/)', existsSync(distIndex), existsSync(distIndex) ? 'ok' : 'run npm run build')

console.log()
