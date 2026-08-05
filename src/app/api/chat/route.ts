import { streamText } from 'ai'
import { z } from 'zod'
import { RAZIEL_SYSTEM_PROMPT } from '@/features/raziel/lib/system-prompt'
import { rateLimit } from '@/shared/lib/rate-limit'

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
})

export async function POST(req: Request) {
  // Rate limiting — 20 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed, remaining } = rateLimit(ip, 20, 60_000)

  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' },
    })
  }

  // Validate input
  let parsed: z.infer<typeof RequestSchema>
  try {
    const body = await req.json()
    parsed = RequestSchema.parse(body)
  } catch {
    return new Response(JSON.stringify({ error: 'Payload inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Log request (no PII — only metadata)
  console.log(`[Raziel] ${new Date().toISOString()} | IP: ${ip.slice(0, 8)}*** | msgs: ${parsed.messages.length} | remaining: ${remaining}`)

  // ── Determinar proveedor ──────────────────────────────────────────
  // Prioridad: OPENROUTER_API_KEY (diseño original) > ANTHROPIC_API_KEY (fallback)
  const orKey = process.env.OPENROUTER_API_KEY
  const antKey = process.env.ANTHROPIC_API_KEY

  console.log(`[Raziel] Keys: OR=${orKey ? orKey.slice(0, 7) + '...' : 'NO'} | ANT=${antKey ? antKey.slice(0, 7) + '...' : 'NO'}`)

  let model;

  if (orKey) {
    // ── OpenRouter (provider principal — soporta Claude, Gemini, GPT, etc.) ──
    const { createOpenAI } = await import('@ai-sdk/openai')
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: orKey,
    })
    // google/gemini-2.5-flash: rápido, económico, excelente en español
    model = openrouter('google/gemini-2.5-flash')
    console.log(`[Raziel] Provider: OpenRouter → google/gemini-2.5-flash`)
  } else if (antKey) {
    // ── Anthropic directo (fallback) ──
    const { anthropic } = await import('@ai-sdk/anthropic')
    model = anthropic('claude-sonnet-4-20250514')
    console.log(`[Raziel] Provider: Anthropic → claude-sonnet-4-20250514`)
  } else {
    console.error('[Raziel] ERROR: No hay API keys configuradas')
    return new Response(JSON.stringify({ 
      error: 'No hay proveedor de IA configurado. Configura OPENROUTER_API_KEY o ANTHROPIC_API_KEY.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Ejecutar stream ──────────────────────────────────────────────
  try {
    console.log(`[Raziel] Iniciando streamText...`)
    const result = streamText({
      model,
      system: RAZIEL_SYSTEM_PROMPT,
      messages: parsed.messages,
      maxTokens: 2048,
      onFinish: ({ usage }) => {
        console.log(`[Raziel] ✅ Completado — tokens: ${JSON.stringify(usage)}`)
      },
      onError: (err) => {
        console.error(`[Raziel] ❌ Stream Error:`, err)
      }
    })

    console.log(`[Raziel] Stream creado, enviando respuesta...`)
    return result.toDataStreamResponse({
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    })
  } catch (error: any) {
    console.error('[Raziel] ❌ Catch Error:', error?.message || error)
    return new Response(JSON.stringify({ 
      error: 'Error en el motor de IA.',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
