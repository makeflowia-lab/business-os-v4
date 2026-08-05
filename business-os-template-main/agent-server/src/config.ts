import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readEnvFile } from './env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const PROJECT_ROOT = join(__dirname, '..')
export const STORE_DIR = join(PROJECT_ROOT, 'store')
export const UPLOADS_DIR = join(PROJECT_ROOT, 'workspace', 'uploads')

const env = readEnvFile()

// === TELEGRAM ===
export const TELEGRAM_BOT_TOKEN = env['TELEGRAM_BOT_TOKEN'] ?? ''
export const ALLOWED_CHAT_ID = env['ALLOWED_CHAT_ID'] ?? ''
export const TELEGRAM_GROUP_ID = env['TELEGRAM_GROUP_ID'] ?? ''

// === VOICE ===
export const GROQ_API_KEY = env['GROQ_API_KEY'] ?? ''
export const ELEVENLABS_API_KEY = env['ELEVENLABS_API_KEY'] ?? ''
export const ELEVENLABS_VOICE_ID = env['ELEVENLABS_VOICE_ID'] ?? ''

// === ANALYTICS (optional Supabase for business metrics) ===
export const ANALYTICS_SUPABASE_URL = env['ANALYTICS_SUPABASE_URL'] ?? ''
export const ANALYTICS_SUPABASE_KEY = env['ANALYTICS_SUPABASE_KEY'] ?? ''

// === MISC ===
export const MAX_MESSAGE_LENGTH = 4096
export const TYPING_REFRESH_MS = 4000
export const AGENT_TIMEOUT_MS = 600_000  // 10 minutos máximo por query
