import {
  searchMemoriesFTS,
  getRecentMemories,
  touchMemory,
  saveMemory,
  decayMemories as dbDecayMemories,
} from './db.js'
import { wrapMemoryContext, redactSecrets } from './security.js'

// Signals indicating semantic memory (something about the user / preferences)
const SEMANTIC_PATTERN = /\b(my|i am|i'm|i'm|i prefer|remember|always|never|i work|i use|i live|i like|i hate|my name|my business|my project)\b/i

/**
 * Builds the memory context to inject before the user's message.
 * Combines FTS5 search (top 3) + recent memories (last 5) deduplicated.
 */
export async function buildMemoryContext(chatId: string, userMessage: string): Promise<string> {
  const ftsResults = searchMemoriesFTS(chatId, userMessage, 3)
  const recentResults = getRecentMemories(chatId, 5)

  // Deduplicate by id
  const seen = new Set<number>()
  const combined = [...ftsResults, ...recentResults].filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  if (combined.length === 0) return ''

  // Touch each memory (updates accessed_at and reinforces salience)
  for (const m of combined) {
    touchMemory(m.id)
  }

  const lines = combined.map((m) => `- ${m.content} (${m.sector})`).join('\n')
  return wrapMemoryContext(lines)
}

/**
 * Saves a conversation turn to the memory database.
 * Detects if it's semantic (about the user) or episodic (general conversation).
 */
export async function saveConversationTurn(
  chatId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  // Skip trivial messages or commands
  if (userMsg.length <= 20 || userMsg.startsWith('/')) return

  const sector: 'semantic' | 'episodic' = SEMANTIC_PATTERN.test(userMsg) ? 'semantic' : 'episodic'

  // Save the user+assistant pair as a single memory (redact secrets from agent output)
  const content = `User: ${userMsg.slice(0, 500)}\nAssistant: ${redactSecrets(assistantMsg.slice(0, 500))}`
  saveMemory(chatId, content, sector)
}

/**
 * Daily decay: salience *= 0.98 for memories older than 24h.
 * Auto-deletes memories with salience < 0.1.
 */
export function runDecaySweep(): void {
  dbDecayMemories()
}
