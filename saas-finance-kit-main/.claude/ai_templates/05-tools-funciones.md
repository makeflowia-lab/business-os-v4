# Bloque 05: Tools y Funciones

> Agregar herramientas que el modelo puede ejecutar.

**Tiempo:** 20 minutos
**Prerequisitos:** Bloque 01 (Chat Streaming)

---

## Que Obtienes

- Tools definidas con Zod schemas
- Ejecucion automatica o manual
- Resultados visibles en el chat
- Loop agentico con maxSteps

---

## 1. Definir Tools con Zod

```typescript
// features/chat/tools/index.ts

import { z } from 'zod'
import { tool } from 'ai'

// Tool: Obtener clima
export const getWeather = tool({
  description: 'Obtiene el clima actual de una ciudad',
  parameters: z.object({
    city: z.string().describe('Nombre de la ciudad'),
  }),
  execute: async ({ city }) => {
    // Aqui iria la llamada a una API de clima
    // Por ahora simulamos
    return {
      city,
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['soleado', 'nublado', 'lluvioso'][Math.floor(Math.random() * 3)],
    }
  },
})

// Tool: Calcular
export const calculate = tool({
  description: 'Realiza calculos matematicos',
  parameters: z.object({
    operation: z.enum(['sum', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ operation, a, b }) => {
    const operations = {
      sum: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b !== 0 ? a / b : 'Error: division por cero',
    }
    return {
      operation,
      a,
      b,
      result: operations[operation],
    }
  },
})

// Tool: Buscar en base de datos (ejemplo)
export const searchProducts = tool({
  description: 'Busca productos en el catalogo',
  parameters: z.object({
    query: z.string().describe('Termino de busqueda'),
    category: z.string().optional().describe('Categoria opcional'),
    maxPrice: z.number().optional().describe('Precio maximo'),
  }),
  execute: async ({ query, category, maxPrice }) => {
    // Aqui iria la busqueda real en Supabase
    return {
      query,
      results: [
        { id: 1, name: `Producto ${query} 1`, price: 100 },
        { id: 2, name: `Producto ${query} 2`, price: 200 },
      ],
      total: 2,
    }
  },
})

// Exportar todas las tools
export const tools = {
  getWeather,
  calculate,
  searchProducts,
}
```

---

## 2. API Route con Tools

```typescript
// app/api/chat/route.ts
// MODIFICAR: Agregar tools

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { tools } from '@/features/chat/tools'

const SYSTEM_PROMPT = `Eres un asistente con acceso a herramientas.

Herramientas disponibles:
- getWeather: Consultar el clima de una ciudad
- calculate: Realizar calculos matematicos
- searchProducts: Buscar productos en el catalogo

Usa las herramientas cuando sea apropiado para responder al usuario.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(MODELS.balanced),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    maxSteps: 5,  // Permite multiples llamadas a tools
  })

  return result.toUIMessageStreamResponse()
}
```

---

## 3. Mostrar Tool Calls en UI

```typescript
// features/chat/components/ChatWithTools.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'

export function ChatWithTools() {
  const { messages, status, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    sendMessage({ text })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            {/* Rol del mensaje */}
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {/* Renderizar partes del mensaje */}
                {m.parts?.map((part, i) => {
                  // Texto normal
                  if (part.type === 'text') {
                    return <p key={i}>{part.text}</p>
                  }

                  // Tool call (el modelo quiere usar una tool)
                  if (part.type === 'tool-invocation') {
                    return (
                      <div key={i} className="my-2 p-2 bg-purple-50 rounded border border-purple-200">
                        <div className="flex items-center gap-2 text-purple-700 text-sm">
                          <span>🔧</span>
                          <span className="font-medium">{part.toolInvocation.toolName}</span>
                          {part.toolInvocation.state === 'calling' && (
                            <span className="animate-pulse">ejecutando...</span>
                          )}
                        </div>
                        {/* Mostrar argumentos */}
                        <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(part.toolInvocation.args, null, 2)}
                        </pre>
                        {/* Mostrar resultado si existe */}
                        {part.toolInvocation.state === 'result' && (
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <span className="text-green-700 text-sm">Resultado:</span>
                            <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(part.toolInvocation.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg animate-pulse">
              Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje... (prueba: '¿Qué clima hace en Madrid?' o 'Calcula 25 * 4')"
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
```

---

## 4. Tool con Confirmacion Manual

Si quieres que el usuario confirme antes de ejecutar:

```typescript
// features/chat/tools/index.ts

export const deleteItem = tool({
  description: 'Elimina un item (requiere confirmacion)',
  parameters: z.object({
    itemId: z.string(),
    itemName: z.string(),
  }),
  // Sin execute = requiere confirmacion manual
})
```

```typescript
// En el componente, manejar confirmacion
const handleToolConfirm = async (toolCallId: string, result: any) => {
  // Enviar resultado de la tool manualmente
  sendMessage({
    text: '',
    toolResults: [{
      toolCallId,
      result,
    }],
  })
}
```

---

## 5. Ejemplos de Tools Utiles

### Tool: Consultar Supabase

```typescript
export const queryDatabase = tool({
  description: 'Consulta datos de la base de datos',
  parameters: z.object({
    table: z.enum(['products', 'orders', 'users']),
    filters: z.record(z.string()).optional(),
    limit: z.number().default(10),
  }),
  execute: async ({ table, filters, limit }) => {
    const supabase = createClient()
    let query = supabase.from(table).select('*').limit(limit)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) return { error: error.message }
    return { data, count: data?.length }
  },
})
```

### Tool: Enviar Email

```typescript
export const sendEmail = tool({
  description: 'Envia un email',
  parameters: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  execute: async ({ to, subject, body }) => {
    // Integrar con Resend, SendGrid, etc.
    console.log(`Enviando email a ${to}: ${subject}`)
    return { success: true, messageId: 'msg_123' }
  },
})
```

### Tool: Crear Registro

```typescript
export const createRecord = tool({
  description: 'Crea un nuevo registro en la base de datos',
  parameters: z.object({
    table: z.enum(['products', 'orders']),
    data: z.record(z.any()),
  }),
  execute: async ({ table, data }) => {
    const supabase = createClient()
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) return { error: error.message }
    return { created: result }
  },
})
```

---

## Checklist

- [ ] Tools definidas con Zod schemas
- [ ] API route incluye tools y maxSteps
- [ ] UI muestra tool calls y resultados
- [ ] Tools ejecutan correctamente
- [ ] (Opcional) Confirmacion manual para tools sensibles

---

## Nota sobre Action Stream

Si prefieres el patron **Action Stream** (donde TODAS las acciones son visibles),
ve a `01-alt-action-stream.md`. En ese patron, las "tools" son acciones
estructuradas que el usuario ve en tiempo real.
