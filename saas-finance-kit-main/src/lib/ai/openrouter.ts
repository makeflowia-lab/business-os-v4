// lib/ai/openrouter.ts
// Provider de IA via OpenRouter - SOLO PARA USO EN SERVIDOR
// Para modelos y tipos, usar '@/lib/ai/models'

import { createOpenRouter } from '@openrouter/ai-sdk-provider'

// Re-export modelos para compatibilidad
export { AGENT_MODELS, DEFAULT_MODEL, type AgentModelKey } from './models'

// Provider - solo usar en API routes (server-side)
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})
