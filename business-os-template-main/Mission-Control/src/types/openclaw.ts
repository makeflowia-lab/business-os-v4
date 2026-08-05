import { z } from 'zod'

// Coding tools that indicate real code work (from reference repo)
// "write" excluded — it's also used for markdown/docs
export const CODING_TOOLS = ['edit', 'exec', 'bash', 'run', 'process'] as const

// OpenClaw webhook event schema
export const openClawEventSchema = z.object({
  runId: z.string(),
  action: z.enum(['start', 'progress', 'end', 'error', 'document']),
  sessionKey: z.string().optional(),
  agentId: z.string().optional(),
  timestamp: z.string().optional(),
  error: z.string().optional(),
  prompt: z.string().optional(),
  source: z.string().optional(),
  message: z.string().optional(),
  response: z.string().optional(),
  eventType: z.string().optional(), // e.g. "tool:start", "lifecycle:start"
  document: z.object({
    title: z.string(),
    content: z.string(),
    type: z.string(),
    path: z.string().optional(),
  }).optional(),
})

export type OpenClawEvent = z.infer<typeof openClawEventSchema>
