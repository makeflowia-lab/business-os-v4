// lib/ai/models.ts
// Configuración de modelos disponibles (safe para cliente y servidor)

// Modelos disponibles para el CFO Agent
export const AGENT_MODELS = {
  'haiku-4.5': {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    description: 'Rapido y economico',
    speed: 'fast',
  },
  'sonnet-4': {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Balanceado',
    speed: 'medium',
  },
  'gemini-3-flash': {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: 'Google',
    description: 'Multimodal rapido',
    speed: 'fast',
  },
} as const

export type AgentModelKey = keyof typeof AGENT_MODELS

// Modelo por defecto
export const DEFAULT_MODEL: AgentModelKey = 'haiku-4.5'
