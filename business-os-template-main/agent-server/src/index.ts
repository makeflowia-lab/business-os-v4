import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { TELEGRAM_BOT_TOKEN, STORE_DIR } from './config.js'
import { readEnvFile } from './env.js'
import { initDatabase } from './db.js'
import { initScheduler, stopScheduler } from './scheduler.js'
import { cleanupOldUploads } from './media.js'
import { runDecaySweep } from './memory.js'
import { createBot, createSender } from './bot.js'
import { startMCServer } from './server.js'
import { logger } from './logger.js'

const PID_FILE = join(STORE_DIR, 'agent-server.pid')
const __filename = fileURLToPath(import.meta.url)

// ─── Lock ────────────────────────────────────────────────────────────────────

function acquireLock(): void {
  mkdirSync(STORE_DIR, { recursive: true })
  if (existsSync(PID_FILE)) {
    const existingPid = readFileSync(PID_FILE, 'utf8').trim()
    // Verificar si el proceso aún corre
    try {
      process.kill(parseInt(existingPid, 10), 0)
      logger.error({ pid: existingPid }, 'Another instance is already running. Exiting.')
      process.exit(1)
    } catch {
      // El proceso no existe — PID file stale
      logger.warn({ pid: existingPid }, 'Stale PID file found, removing.')
      unlinkSync(PID_FILE)
    }
  }
  writeFileSync(PID_FILE, String(process.pid))
  logger.debug({ pid: process.pid, pidFile: PID_FILE }, 'lock acquired')
}

function releaseLock(): void {
  try {
    if (existsSync(PID_FILE)) unlinkSync(PID_FILE)
  } catch {
    // ignorar
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════╗')
  console.log('║         Agent Server v1           ║')
  console.log('╚═══════════════════════════════════╝')
  console.log()

  // Validar variables críticas
  if (!TELEGRAM_BOT_TOKEN) {
    logger.error('TELEGRAM_BOT_TOKEN is not set. Check your .env file.')
    process.exit(1)
  }

  // Adquirir lock (singleton)
  acquireLock()

  // Base de datos
  initDatabase()
  logger.info('database initialized')

  // Expose gog CLI config to Agent SDK subprocess (non-secrets, needed for Google Workspace)
  const gogVars = readEnvFile(['GOG_KEYRING_PASSWORD', 'GOG_ENABLE_COMMANDS'])
  for (const [k, v] of Object.entries(gogVars)) { if (v) process.env[k] = v }

  // Mission Control web server (localhost:3099)
  startMCServer()

  // Memory decay al arrancar + cada 24h
  runDecaySweep()
  const decayInterval = setInterval(runDecaySweep, 24 * 60 * 60 * 1000)

  // Limpiar uploads viejos al arrancar
  cleanupOldUploads()

  // Crear bot
  const bot = createBot()
  const sender = createSender(bot)

  // Iniciar scheduler (seedea tareas default si no existen)
  initScheduler()
  logger.info('scheduler initialized')

  // SIGINT / SIGTERM — shutdown graceful
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down...')
    stopScheduler()
    clearInterval(decayInterval)
    releaseLock()

    try {
      await bot.stop()
    } catch {
      // ignorar errores al detener el bot
    }

    logger.info('goodbye')
    process.exit(0)
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))

  // Iniciar polling de Telegram
  logger.info('starting bot...')
  await bot.start({
    onStart: (info) => {
      logger.info({ username: info.username }, 'bot online')
      console.log(`\n✓ Bot @${info.username} is online. Send a message on Telegram!\n`)
    },
  })
}

main().catch((err) => {
  logger.error({ err }, 'fatal error')
  releaseLock()
  process.exit(1)
})
