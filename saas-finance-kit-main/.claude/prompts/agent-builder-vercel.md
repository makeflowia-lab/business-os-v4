# Construir Agentes con Vercel AI SDK

Guía para construir agentes IA con Vercel AI SDK + OpenRouter en frontend Next.js.

---

## Cuándo Usar

- Frontend Next.js con interfaz de chat
- Necesitas respuestas en streaming con SSE
- Quieres llamadas a herramientas con tipos seguros en TypeScript
- Cambiar entre múltiples proveedores de IA

---

## Inicio Rápido

### Instalación

```bash
npm install ai @openrouter/ai-sdk-provider zod
```

### Variables de Entorno

```env
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Backend: Manejador de Rutas

```typescript
// app/api/chat/route.ts
import { OpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('openai/gpt-4o'),
    system: 'You are a helpful assistant',
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

## Frontend: Hook useChat

```typescript
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div className="inline-block p-3 rounded-lg">{m.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje..."
          disabled={isLoading}
          className="w-full px-4 py-2 border rounded"
        />
      </form>
    </div>
  );
}
```

---

## Llamadas a Herramientas

```typescript
import { z } from 'zod';
import { tool } from 'ai';

const tools = {
  generateImage: tool({
    description: 'Genera imágenes usando IA',
    parameters: z.object({
      prompt: z.string().describe('Descripción de la imagen'),
      numImages: z.number().min(1).max(10).default(1),
    }),
    execute: async ({ prompt, numImages }) => {
      const images = await generateImages(prompt, numImages);
      return { images };
    },
  }),
};

// En el manejador de rutas
const result = streamText({
  model: openrouter('openai/gpt-4o'),
  messages,
  tools,
  maxSteps: 5, // Habilita bucle agéntico
});
```

---

## Configuración Multi-Proveedor

```typescript
import { OpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Cambiar modelos fácilmente
const gpt4 = openrouter('openai/gpt-4o');
const claude = openrouter('anthropic/claude-3-5-sonnet');
const gemini = openrouter('google/gemini-2.0-flash-exp');
```

---

## Mejores Prácticas

1. **Seguridad de Tipos**: Usar Zod para parámetros de herramientas
2. **Error Boundaries**: Envolver interfaz de chat en ErrorBoundary
3. **Estados de Carga**: Mostrar UI de carga durante streaming
4. **Resultados de Herramientas**: Mostrar ejecuciones de herramientas al usuario
5. **Límites de Tasa**: Implementar rate limits en rutas de API
6. **Gestión de Contexto**: Limitar historial de mensajes para evitar desbordamiento de tokens

---

## Recursos

- [Documentación Vercel AI SDK](https://sdk.vercel.ai)
- [Proveedor OpenRouter](https://github.com/OpenRouterTeam/ai-sdk-provider)
- [Guía de Llamadas a Herramientas](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
