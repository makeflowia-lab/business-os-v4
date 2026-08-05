# AI Templates - Sistema de Bloques LEGO

> **"El 20% de componentes que produce el 80% de los resultados"**

Templates copy-paste para construir agentes IA con **Vercel AI SDK v5 + OpenRouter**.

---

## La Filosofia LEGO

Cada bloque es **independiente pero compatible**. Todos usan el mismo estandar.

```
┌─────────────────────────────────────────────────────────────────┐
│                     TU AGENTE IA                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │    CHAT     │  │   ACTION    │  │   VISION    │            │
│   │  STREAMING  │  │   STREAM    │  │  ANALYSIS   │            │
│   │  (useChat)  │  │ (alternativa)│ │  (Gemini)   │            │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│          │                │                │                    │
│   ┌──────┴────────────────┴────────────────┴──────┐            │
│   │           VERCEL AI SDK v5                    │            │
│   │    streamText() + useChat + UIMessage         │            │
│   └──────────────────────┬───────────────────────┘            │
│                          │                                     │
│   ┌──────────────────────┴───────────────────────┐            │
│   │              OPENROUTER                       │            │
│   │         + :online suffix (Web Search)        │            │
│   └──────────────────────┬───────────────────────┘            │
│                          │                                     │
│   ┌──────────────────────┴───────────────────────┐            │
│   │              SUPABASE                        │            │
│   │    ┌──────────┐  ┌──────────┐               │            │
│   │    │ Auth     │  │ Historial│               │            │
│   │    │ (users)  │  │  (msgs)  │               │            │
│   │    └──────────┘  └──────────┘               │            │
│   └──────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Orden de Construccion (Progresivo)

| # | Bloque | Archivo | Prerequisitos | Tiempo |
|---|--------|---------|---------------|--------|
| 00 | **Setup Base** | `00-setup-base.md` | Ninguno | 10 min |
| 01 | **Chat Streaming** | `01-chat-streaming.md` | Bloque 00 | 15 min |
| 02 | **Web Search** | `02-web-search.md` | Bloque 01 | 5 min |
| 03 | **Historial** | `03-historial-supabase.md` | Bloque 01 | 20 min |
| 04 | **Vision** | `04-vision-analysis.md` | Bloque 01 | 25 min |
| 05 | **Tools** | `05-tools-funciones.md` | Bloque 01 | 20 min |
| | | | | |
| ALT | **Action Stream** | `01-alt-action-stream.md` | Bloque 00 | 30 min |

---

## Dos Caminos

### Camino A: Chat Tradicional (useChat)
```
00 Setup → 01 Chat → 02 Web → 03 Historial → 04 Vision → 05 Tools
```
- Respuestas de texto con streaming
- UI flexible (tu renderizas)
- Ideal para: chatbots, asistentes, Q&A

### Camino B: Agente Transparente (Action Stream)
```
00 Setup → 01-ALT Action Stream → 02 Web → 03 Historial → 04 Vision
```
- Acciones visibles en tiempo real
- El usuario VE cada paso del agente
- Ideal para: calculadoras ROI, auditorias, diagnosticos

**Nota:** Los caminos son mutuamente excluyentes en el bloque 01.
Los bloques 02-05 funcionan con ambos caminos.

---

## Por Que Vercel AI SDK v5

### Ventajas del Estandar

| Aspecto | Con SDK | Sin SDK (fetch directo) |
|---------|---------|-------------------------|
| Streaming | Automatico | ~50 lineas manuales |
| Estado | useChat maneja todo | useState manual |
| Tipos | TypeScript integrado | Definir manualmente |
| Tools | Zod schemas nativos | JSON schema manual |
| Providers | Cambiar 1 linea | Reescribir cliente |
| Codigo | ~30 lineas | ~150+ lineas |

### Composabilidad Real

```typescript
// Todos los bloques usan el MISMO tipo
import { UIMessage } from 'ai'

// Historial: guarda UIMessage[]
// Vision: añade contexto a messages[]
// Web Search: flag en streamText()
// Tools: aparecen en UIMessage.parts

// TODOS HABLAN EL MISMO IDIOMA
```

### UI Headless

```typescript
const { messages, sendMessage, status } = useChat()

// El SDK NO impone estilos
// Solo te da: datos + funciones
// Tu renderizas con TU diseño
```

---

## Compatibilidad de Bloques

```
                    ┌─────┬─────┬─────┬─────┬─────┬─────┐
                    │ 00  │ 01  │ 02  │ 03  │ 04  │ 05  │
                    │Setup│Chat │Web  │Hist │Vis  │Tool │
┌───────────────────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ 00. Setup Base    │  -  │ ✅  │ ✅  │ ✅  │ ✅  │ ✅  │
│ 01. Chat Stream   │ REQ │  -  │ ✅  │ ✅  │ ✅  │ ✅  │
│ 01-ALT. Action    │ REQ │ ❌  │ ✅  │ ✅  │ ✅  │ ⚠️  │
│ 02. Web Search    │ ✅  │ ✅  │  -  │ ✅  │ ✅  │ ✅  │
│ 03. Historial     │ ✅  │ ✅  │ ✅  │  -  │ ✅  │ ✅  │
│ 04. Vision        │ ✅  │ ✅  │ ✅  │ ✅  │  -  │ ✅  │
│ 05. Tools         │ ✅  │ ✅  │ ✅  │ ✅  │ ✅  │  -  │
└───────────────────┴─────┴─────┴─────┴─────┴─────┴─────┘

REQ = Requerido
✅  = Compatible
❌  = Mutuamente excluyente
⚠️  = Requiere adaptacion (Action Stream ya incluye "tools" como acciones)
```

---

## Stack Compartido

```env
# .env.local (todos los bloques)
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
# Dependencias comunes
npm install ai@latest @ai-sdk/react @openrouter/ai-sdk-provider zod
npm install @supabase/supabase-js @supabase/ssr
```

---

## Como Usar

### Referencia directa
```
@ai_templates/01-chat-streaming.md
Implementa el chat con streaming en mi proyecto
```

### Combinacion especifica
```
@ai_templates/_index.md
Necesito: Setup + Chat + Web Search + Historial
```

### Agente transparente
```
@ai_templates/01-alt-action-stream.md
Implementa un agente que muestre cada paso al usuario
```

---

## Combinaciones Recomendadas

### Chatbot Basico (25 min)
```
00 Setup + 01 Chat + 02 Web Search
```

### Asistente con Memoria (45 min)
```
00 + 01 + 02 + 03 Historial
```

### Analista de Documentos (70 min)
```
00 + 01 + 02 + 03 + 04 Vision
```

### Agente con Tools (65 min)
```
00 + 01 + 02 + 03 + 05 Tools
```

### Agente Transparente (60 min)
```
00 + 01-ALT Action Stream + 02 + 03
```

---

## Principios de Diseno

1. **Copy-paste ready**: Codigo listo para usar
2. **Modificar solo lo marcado**: Busca `// MODIFICAR:`
3. **Core inmutable**: Busca `// NUNCA MODIFICAR`
4. **Tipos seguros**: TypeScript + Zod
5. **UI headless**: Tu decides el diseño
6. **SDK v5**: Vercel AI SDK como estandar

---

*"No reinventes la rueda. Ensambla bloques probados."*
