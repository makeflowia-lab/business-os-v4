import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// fileURLToPath SIEMPRE — nunca new URL().pathname (rompe con espacios en paths)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

/**
 * Lee el archivo .env sin contaminar process.env.
 * El subprocess del Agent SDK hereda process.env — nunca lo polucionar con secrets.
 */
export function readEnvFile(keys?: string[]): Record<string, string> {
  try {
    const content = readFileSync(join(PROJECT_ROOT, '.env'), 'utf-8')
    const result: Record<string, string> = {}

    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue

      const key = trimmed.slice(0, eqIdx).trim()
      let value = trimmed.slice(eqIdx + 1).trim()

      // Manejar valores entre comillas: KEY="valor con espacios" o KEY='valor'
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (keys === undefined || keys.includes(key)) {
        result[key] = value
      }
    }

    return result
  } catch {
    return {}
  }
}
