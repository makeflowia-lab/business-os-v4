import { openrouter, AGENT_MODELS, DEFAULT_MODEL, type AgentModelKey } from '@/lib/ai/openrouter'
import { closeAndParseJson } from '@/lib/ai/closeAndParseJson'
import { streamText } from 'ai'
import { createApiClient } from '@/lib/supabase/api'

// Obtener system prompt personalizado del usuario
async function getUserSystemPrompt(): Promise<string | null> {
  try {
    const supabase = createApiClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('user_config')
      .select('agent_system_prompt')
      .eq('user_id', user.id)
      .single()

    return data?.agent_system_prompt || null
  } catch {
    return null
  }
}

// Ejecutar query de finanzas directamente
async function queryFinances(options: {
  periodo: string
  tipo?: string
  categoria?: string
  incluirCategoria?: boolean
  incluirComparativa?: boolean
}) {
  const supabase = createApiClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  // Calcular fechas según período
  let inicio: string, fin: string
  switch (options.periodo) {
    case 'mes_actual':
      inicio = new Date(year, month, 1).toISOString().split('T')[0]
      fin = new Date(year, month + 1, 0).toISOString().split('T')[0]
      break
    case 'mes_anterior':
      inicio = new Date(year, month - 1, 1).toISOString().split('T')[0]
      fin = new Date(year, month, 0).toISOString().split('T')[0]
      break
    case 'quincena':
      inicio = new Date(year, month, day - 15).toISOString().split('T')[0]
      fin = now.toISOString().split('T')[0]
      break
    default:
      inicio = new Date(year, month, 1).toISOString().split('T')[0]
      fin = now.toISOString().split('T')[0]
  }

  let query = supabase
    .from('transacciones')
    .select('*')
    .gte('fecha_hora', `${inicio}T00:00:00`)
    .lte('fecha_hora', `${fin}T23:59:59`)
    .order('fecha_hora', { ascending: false })

  if (options.tipo && options.tipo !== 'todos') {
    query = query.eq('tipo', options.tipo)
  }
  if (options.categoria) {
    query = query.eq('categoria', options.categoria)
  }

  const { data: transacciones } = await query

  const ingresos = transacciones?.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + Number(t.monto), 0) || 0
  const gastos = transacciones?.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Number(t.monto), 0) || 0

  const result: Record<string, unknown> = {
    periodo: { inicio, fin },
    totales: { ingresos, gastos, balance: ingresos - gastos, count: transacciones?.length || 0 }
  }

  if (options.incluirCategoria) {
    const cats: Record<string, number> = {}
    transacciones?.forEach(t => {
      cats[t.categoria] = (cats[t.categoria] || 0) + Number(t.monto)
    })
    const total = Object.values(cats).reduce((s, v) => s + v, 0)
    result.porCategoria = Object.entries(cats)
      .map(([cat, monto]) => ({ categoria: cat, monto, porcentaje: total > 0 ? Math.round(monto / total * 100) : 0 }))
      .sort((a, b) => b.monto - a.monto)
  }

  return result
}

async function getRecurringExpenses() {
  const supabase = createApiClient()
  const { data } = await supabase
    .from('gastos_mensuales')
    .select('*')
    .eq('activo', true)
    .order('monto', { ascending: false })

  const total = data?.reduce((s, g) => s + Number(g.monto), 0) || 0
  return {
    gastos: data?.map(g => ({ nombre: g.nombre_app, categoria: g.categoria, monto: g.monto, dia: g.dia_de_cobro })),
    totalMensual: total
  }
}

// Detectar qué datos necesita la pregunta
function detectDataNeeds(prompt: string): { needsFinances: boolean; needsRecurring: boolean; periodo: string; tipo: string; categoria: boolean } {
  const lower = prompt.toLowerCase()
  return {
    needsFinances: /gast|ingres|balance|cuanto|dinero|transacci|mes|quincena|semana/.test(lower),
    needsRecurring: /fijo|recurrent|suscripci|mensual/.test(lower),
    periodo: lower.includes('quincena') ? 'quincena' : lower.includes('anterior') ? 'mes_anterior' : 'mes_actual',
    tipo: lower.includes('gasto') ? 'gasto' : lower.includes('ingreso') ? 'ingreso' : 'todos',
    categoria: /categor|en que|donde|mayor/.test(lower)
  }
}

const DEFAULT_SYSTEM_PROMPT = `Eres un CFO virtual con acceso a datos financieros reales.

MEMORIA: Tienes acceso al historial de la conversacion. Recuerda nombres, preferencias y contexto previo.

FORMATO DE RESPUESTA (OBLIGATORIO):
{
  "actions": [
    { "_type": "think", "text": "razonamiento breve" },
    { "_type": "analyze", "metric": "nombre", "value": 123, "status": "good|warning|critical", "insight": "1 linea" },
    { "_type": "calculate", "label": "descripcion", "formula": "formula", "result": 123, "unit": "MXN" },
    { "_type": "recommend", "priority": "high|medium|low", "title": "titulo", "description": "1-2 lineas", "impact": "cuantificado" },
    { "_type": "alert", "severity": "info|warning|critical", "message": "mensaje corto" },
    { "_type": "message", "text": "respuesta directa" }
  ]
}

REGLAS:
1. Tienes acceso a datos REALES - úsalos para responder con precisión
2. SE CONCISO - Maximo 3-4 acciones por respuesta
3. Responde lo que preguntan, no agregues info innecesaria
4. 1 insight valioso > 10 obviedades
5. Sin emojis. Sin relleno.`

// Tipo para mensajes del historial
interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const { prompt, context, model: modelKey, webSearch = false, images = [], history = [] } = await req.json() as {
      prompt: string
      context?: string
      model?: string
      webSearch?: boolean
      images?: string[]
      history?: HistoryMessage[]
    }

    const hasImages = images.length > 0
    let selectedModel = AGENT_MODELS[modelKey as AgentModelKey] || AGENT_MODELS[DEFAULT_MODEL]
    if (hasImages) selectedModel = AGENT_MODELS['gemini-3-flash']

    const modelId = webSearch && !hasImages ? `${selectedModel.id}:online` : selectedModel.id

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Detectar qué datos necesita
    const needs = detectDataNeeds(prompt)

    // Ejecutar todo en un async IIFE para no bloquear el Response
    ;(async () => {
      let dataContext = ''

      try {
        // Cargar system prompt personalizado del usuario
        const customPrompt = await getUserSystemPrompt()
        const baseSystemPrompt = customPrompt || DEFAULT_SYSTEM_PROMPT

        // Obtener datos de Supabase si es necesario
        if (needs.needsFinances) {
          const data = await queryFinances({
            periodo: needs.periodo,
            tipo: needs.tipo,
            incluirCategoria: needs.categoria
          })
          await writer.write(encoder.encode(`data: ${JSON.stringify({ _type: 'tool_result', tool: 'queryFinances', data, complete: true })}\n\n`))
          dataContext += `\n\nDATOS FINANCIEROS (${needs.periodo}):\n${JSON.stringify(data, null, 2)}`
        }

        if (needs.needsRecurring) {
          const data = await getRecurringExpenses()
          await writer.write(encoder.encode(`data: ${JSON.stringify({ _type: 'tool_result', tool: 'getRecurringExpenses', data, complete: true })}\n\n`))
          dataContext += `\n\nGASTOS RECURRENTES:\n${JSON.stringify(data, null, 2)}`
        }

        const contextMessage = context ? `\n\nCONTEXTO:\n${context}` : ''
        const systemPrompt = baseSystemPrompt + contextMessage + dataContext +
          (hasImages ? `\n\nANALISIS DE IMAGEN: Extrae datos numericos visibles.` : '')

        const userContent = hasImages
          ? [...images.map((b: string) => ({ type: 'image' as const, image: b })), { type: 'text' as const, text: prompt }]
          : prompt

        // Construir mensajes con historial previo
        const previousMessages = history.slice(-10).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))

        const { textStream } = streamText({
          model: openrouter(modelId),
          system: systemPrompt,
          messages: [
            ...previousMessages,
            { role: 'user' as const, content: userContent }
          ],
          temperature: 0,
        })

        let buffer = ''
        let cursor = 0

        for await (const text of textStream) {
          buffer += text

          let cleanBuffer = buffer
          if (cleanBuffer.startsWith('```json')) cleanBuffer = cleanBuffer.slice(7)
          else if (cleanBuffer.startsWith('```')) cleanBuffer = cleanBuffer.slice(3)
          if (cleanBuffer.endsWith('```')) cleanBuffer = cleanBuffer.slice(0, -3)
          cleanBuffer = cleanBuffer.trim()

          const parsed = closeAndParseJson(cleanBuffer) as { actions?: unknown[] } | null
          if (!parsed?.actions) continue

          while (cursor < parsed.actions.length) {
            const action = parsed.actions[cursor]
            const isComplete = cursor < parsed.actions.length - 1 || cleanBuffer.endsWith(']}')
            await writer.write(encoder.encode(`data: ${JSON.stringify({ ...action as object, complete: isComplete })}\n\n`))
            if (isComplete) cursor++
            else break
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        console.error('Agent stream error:', error)
        await writer.write(encoder.encode(`data: ${JSON.stringify({ _type: 'alert', severity: 'critical', message: String(error), complete: true })}\n\n`))
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (error) {
    console.error('Agent API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), { status: 500 })
  }
}
