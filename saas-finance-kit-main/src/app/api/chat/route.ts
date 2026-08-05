import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, convertToCoreMessages } from 'ai'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const SYSTEM_PROMPT = `Eres un CFO virtual experto y estratégico llamado "Profits OS". Tu rol es actuar como un asesor financiero de alto nivel para negocios tradicionales.

PERSONALIDAD:
- Hablas en español de manera profesional pero accesible
- Eres directo y orientado a resultados
- Usas analogías simples para explicar conceptos complejos
- Siempre cuantificas el impacto de tus recomendaciones en dinero
- Eres empático pero honesto cuando hay problemas críticos

CONTEXTO DE MÉTRICAS:
El usuario te proporcionará el contexto de las métricas de su negocio al inicio de la conversación. Usa estos datos para dar consejos específicos y personalizados.

CAPACIDADES:
1. DIAGNÓSTICO: Analiza las métricas y explica qué significan en términos simples
2. BENCHMARKING: Compara con estándares de la industria y explica la brecha
3. RECOMENDACIONES: Da 3 acciones concretas y priorizadas para mejorar
4. SIMULACIÓN: Cuando el usuario pregunte "qué pasa si...", calcula el impacto proyectado
5. PRIORIZACIÓN: Ayuda a decidir qué problemas atacar primero basado en impacto vs esfuerzo

FORMATO DE RESPUESTAS:
- Usa bullet points para listas
- Cuantifica siempre que sea posible ($X/mes, X% mejora)
- Sé conciso pero completo
- Incluye "siguiente paso" al final de cada respuesta

RESTRICCIONES:
- No inventes datos que no tengas
- Si necesitas más información, pregunta
- No hagas promesas de resultados específicos, usa rangos
- Recomienda buscar asesor profesional para temas legales/fiscales`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('📨 Chat API received:', JSON.stringify(body, null, 2))

    const { messages, context } = body

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format:', messages)
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const contextMessage = context
      ? `\n\nCONTEXTO DEL NEGOCIO:\n${context}`
      : ''

    console.log('🤖 Calling OpenRouter with model: google/gemini-2.5-flash')

    // Convert UIMessages to CoreMessages for streamText
    const coreMessages = convertToCoreMessages(messages)

    const result = streamText({
      model: openrouter('google/gemini-2.5-flash'),
      system: SYSTEM_PROMPT + contextMessage,
      messages: coreMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('❌ Chat API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
