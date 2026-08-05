# RAZIEL — Soul Reaver: Documentación Técnica Completa

> *"Soy Raziel... primer teniente nacido de Kain. Fui arrojado al abismo. Pero fui reencarnado. Y ahora... sirvo un propósito superior."*

**Versión:** 1.0.0
**Fecha:** 2026-03-21
**Proyecto:** `d:/saas-factory-v4/Raziel/`

---

## ¿Qué es Raziel?

Raziel es un **agente de IA con personalidad dual** inspirado en el personaje Raziel de *Legacy of Kain: Soul Reaver*. Actúa como **asesor comercial supremo** con 7 capacidades integradas:

| # | Módulo | Origen |
|---|--------|--------|
| 1 | Marketing & Ofertas (metodología Hormozi) | `arquitectura-de-marketing-plantilla-main/` |
| 2 | CFO Virtual (finanzas, KPIs) | `saas-finance-kit-main/` |
| 3 | Business OS (operaciones, Mission Control) | `business-os-template-main/` |
| 4 | Auditor de Seguridad (vulnerabilidades) | `mimir-son/` |
| 5 | Documentación Legal (LFPDPPP, contratos) | `SaaS-legal/` |
| 6 | Propuesta Tecnológica (3 etapas + PDF) | `saas-propuesta-pro/` |
| 7 | Docs por Tipo de Proyecto (CLOUD/LOCAL/VPS) | `mode/` |

---

## Stack Técnico

```
Framework:    Next.js 16 (App Router + Turbopack)
Runtime:      React 19 + TypeScript 5.7
Estilos:      Tailwind CSS 3.4
AI Engine:    Vercel AI SDK v4 + Anthropic Claude (claude-sonnet-4-5)
Database:     Neon (PostgreSQL serverless) — preparado, no activo aún
Voz Input:    Web Speech API (SpeechRecognition)
Voz Output:   Web Speech API (SpeechSynthesis) — es-MX, pitch 0.55
Puerto dev:   3003 (3000 ocupado por otro proyecto del monorepo)
```

---

## Arquitectura de Archivos

```
Raziel/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          ← AI streaming endpoint
│   │   ├── globals.css               ← Tema gótico oscuro + animaciones
│   │   ├── layout.tsx                ← Root layout dark mode
│   │   └── page.tsx                  ← UI principal (chat + avatar)
│   │
│   └── features/
│       └── raziel/
│           ├── components/
│           │   ├── RazielAvatar.tsx  ← Avatar dual con transición siniestra
│           │   └── ChatMessage.tsx   ← Burbujas de chat + TypingIndicator
│           ├── hooks/
│           │   └── useVoice.ts       ← TTS + STT + lip sync
│           └── lib/
│               └── system-prompt.ts  ← Cerebro: 7 capacidades integradas
│
├── public/
│   └── avatars/
│       ├── estado-a.png              ← Raziel forma humana (imagen Gemini AI)
│       ├── estado-b.png              ← Raziel Soul Reaver (imagen Gemini AI)
│       └── LEEME.md                  ← Instrucciones de imágenes
│
├── [repos de referencia]/            ← Conocimiento base del agente
│   ├── arquitectura-de-marketing-plantilla-main/
│   ├── saas-finance-kit-main/
│   ├── business-os-template-main/
│   ├── mimir-son/
│   ├── SaaS-legal/
│   ├── saas-propuesta-pro/
│   └── mode/
│
├── .env.local                        ← ANTHROPIC_API_KEY (no committear)
├── .env.local.example                ← Template de variables de entorno
├── CLAUDE.md                         ← Instrucciones para Claude Code
├── GEMINI.md                         ← Espejo para Gemini
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

---

## Modificaciones Realizadas — Paso a Paso

### FASE 1: Scaffolding del Proyecto

**Problema:** La carpeta `Raziel/` estaba vacía (solo tenía `.claude/settings.local.json`).

**Solución:** Se crearon desde cero todos los archivos de configuración base, copiando el patrón del `saas-factory` template pero adaptado para Raziel.

**Archivos creados:**

#### `package.json`
```json
{
  "name": "raziel",
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "ai": "^4.0.0",
    "@ai-sdk/anthropic": "^3.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "@neondatabase/serverless": "^0.10.0",
    "lucide-react": "^0.469.0",
    "react-markdown": "^9.0.0",
    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  }
}
```
**Decisión clave:** Se usó `@neondatabase/serverless` en lugar de `@supabase/supabase-js` porque el usuario usa **Neon** como base de datos.

#### `next.config.ts`
Habilita el MCP server experimental de Next.js 16 en `/_next/mcp`.

#### `tailwind.config.ts`
Define la paleta de colores de Raziel:
- `raziel.bg`: `#060810` (negro azulado profundo)
- `raziel.soul`: `#00d4ff` (azul Soul Reaver)
- `raziel.human`: `#8b5e3c` (marrón cálido humano)
- Animaciones: `glow-pulse`, `soul-flicker`, `fade-in`

#### `tsconfig.json`
**Modificación crítica:** Se excluyeron los repos de referencia del TypeScript compiler:
```json
"exclude": [
  "node_modules",
  "arquitectura-de-marketing-plantilla-main",
  "saas-finance-kit-main",
  "business-os-template-main",
  "mimir-son",
  "SaaS-legal",
  "saas-propuesta-pro",
  "mode"
]
```
Sin esta exclusión, TypeScript intentaba compilar miles de archivos de los repos externos generando cientos de errores.

---

### FASE 2: Cerebro del Agente

#### `src/features/raziel/lib/system-prompt.ts`

El system prompt es el núcleo de Raziel. Estructura:

```
1. PROTOCOLO DE ESTADO DE AVATAR
   - [ESTADO:humano]     → Primera línea obligatoria cuando está en reposo
   - [ESTADO:soul_reaver] → Primera línea obligatoria cuando ejecuta tareas

2. IDENTIDAD
   - Respuesta en español latino con tono siniestro
   - Frase de presentación: "Soy Raziel... primer teniente nacido de Kain..."

3. CAPACIDADES (7 módulos integrados)
   - Marketing Architect (Hormozi)
   - CFO Virtual
   - Business OS
   - Auditor de Seguridad
   - Documentación Legal (LFPDPPP)
   - Propuesta Tecnológica (3 etapas)
   - Docs por Tipo de Proyecto (CLOUD/LOCAL/VPS)

4. PRINCIPIOS DE RAZIEL
   - Enfoque, apalancamiento, precisión, velocidad, claridad, interés compuesto
```

**Por qué `[ESTADO:*]` como primera línea:** El frontend parsea el stream de AI en tiempo real. Al ser la primera línea, la detección del estado ocurre en los primeros milisegundos, permitiendo que la transición del avatar comience mientras Raziel aún está escribiendo su respuesta.

---

### FASE 3: AI Route

#### `src/app/api/chat/route.ts`

```typescript
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: RAZIEL_SYSTEM_PROMPT,
    messages,
    maxTokens: 2048,
  })
  return result.toDataStreamResponse()
}
```

**Decisiones:**
- Se empezó con OpenRouter pero se cambió a **Anthropic directo** cuando el usuario proporcionó su API key de Anthropic.
- `streamText` con `toDataStreamResponse()` para compatibilidad con el hook `useChat` de Vercel AI SDK.
- `maxTokens: 2048` balance entre respuestas completas y costo.

---

### FASE 4: Avatar Dual con Transición Siniestra

#### `src/features/raziel/components/RazielAvatar.tsx`

**El reto:** Un avatar estático que parezca dinámico y haga una transición dramática entre dos estados.

**Solución implementada:**

```
Estado A (Humano)          Estado B (Soul Reaver)
─────────────────          ──────────────────────
Borde marrón cálido   →   Borde azul pulsante
Animación breathing        Float + breathe + scanlines
SVG cara humana            SVG cara calavera
Imagen estado-a.png        Imagen estado-b.png
```

**Transición siniestra (1.4 segundos):**
```
t=0ms    → Cabeza inclina hacia abajo (rotateX 18°)
t=280ms  → Oscuridad total (brightness 0, saturate 0)
t=630ms  → SWAP de imagen (humano → soul reaver, invisible)
t=910ms  → Cabeza sube con flash azul (brightness 2.5, hue-rotate)
t=1200ms → Normaliza filtros
t=1400ms → Completo
```

**Sistema de estados:**
```typescript
useEffect(() => {
  // 1. Trigger animación CSS
  setTransitionClass('transition-to-soul')
  // 2. Swap imagen en el punto más oscuro
  setTimeout(() => setDisplayState('soul_reaver'), 630)
  // 3. Limpiar clases
  setTimeout(() => setTransitionClass(''), 1450)
}, [state])
```

**Animaciones continuas (Soul Reaver activo):**
- `soul-float`: flota 6px arriba/abajo cada 4 segundos
- `soul-breathe`: escala 1.015x cada 3 segundos
- `soul-scanlines`: líneas horizontales semi-transparentes en movimiento
- `eye-glow`: parpadeo ocasional de los ojos (drop-shadow)

---

### FASE 5: Sistema de Voz

#### `src/features/raziel/hooks/useVoice.ts`

**Tecnología:** Web Speech API (nativa del browser, sin costo adicional).

**Configuración de voz siniestra:**
```typescript
utterance.lang = 'es-MX'    // Español latino (México)
utterance.rate = 0.78        // Lento y deliberado
utterance.pitch = 0.55       // Muy grave — menazante
```

**Selección de voz (prioridad):**
1. Voz masculina `es-MX`
2. `es-MX` cualquiera
3. `es-419` (Latam)
4. Español sin "female"
5. Cualquier español
6. Búsqueda por nombre: Jorge, Diego, Carlos, Pablo

**Lip Sync:**
El evento `onboundary` del SpeechSynthesis API dispara en cada palabra. Se expone `mouthOpen: boolean` que activa/desactiva el overlay de la boca en el avatar:

```typescript
utterance.onboundary = (e) => {
  if (e.name === 'word') {
    setMouthOpen(true)
    setTimeout(() => setMouthOpen(false), 120) // duración de sílaba
  }
}
```

El overlay visual es un gradiente en el 28% inferior del avatar (zona de la boca) que brilla sincronizado.

**Reconocimiento de voz (STT):**
```typescript
const recognition = new SpeechRecognition()
recognition.lang = 'es-ES'
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  append({ role: 'user', content: transcript }) // envía directamente
}
```

El usuario toca el micrófono 🎙, habla, y el transcript se envía automáticamente sin necesidad de confirmación.

**Controles en UI:**
- `Volume2 / VolumeX` → toggle auto-speak (header)
- `Square` → detener voz inmediatamente
- `Mic / MicOff` → grabación de voz (barra de input)

---

### FASE 6: UI Principal

#### `src/app/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  ● Raziel    ASESOR COMERCIAL         🔊 Soul Reaver  │  ← Header
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  Avatar      │  Chat messages                        │
│  200×260px   │  (burbujas user/AI)                   │
│              │                                       │
│  RAZIEL      │  [mensaje]                            │
│  SEGADOR...  │  [mensaje]                            │
│              │  ...                                  │
│  Capacidades │                                       │
│  📊 Marketing│                                       │
│  💰 CFO      │                                       │
│  ⚙️ Business  │                                       │
│  🔒 Seguridad│                                       │
│  ⚖️ Legal    │                                       │
│  📋 Propuesta│                                       │
│  📁 Docs     │                                       │
├──────────────┴──────────────────────────────────────┤
│  [🎙] [Habla o escribe con Raziel...]      [→ Send]  │  ← Input bar
│  Enter enviar · 🎙 micrófono · 🔊 Voz activada       │
└─────────────────────────────────────────────────────┘
```

**Detección de estado en tiempo real:**
```typescript
// Detecta en cada chunk del stream
useEffect(() => {
  const last = messages[messages.length - 1]
  if (last?.role === 'assistant') {
    const state = detectState(last.content)
    if (state) setAvatarState(state)
  }
}, [messages])

// También al finalizar para auto-speak
onFinish: (message) => {
  if (autoSpeak) speak(cleanContent(message.content))
}
```

**Sugerencias de inicio:**
```
"Define mi avatar de cliente ideal"
"Analiza mis finanzas del mes"
"Crea mi oferta irresistible"
"¿Quién eres?"
```

---

### FASE 7: CSS — Tema Gótico

#### `src/app/globals.css`

**Paleta de colores:**
```css
--raziel-bg:      #060810   /* Negro azulado profundo */
--raziel-surface: #0d1117   /* Superficie de cards */
--raziel-border:  #1a2744   /* Bordes */
--raziel-blue:    #0ea5e9   /* Azul interactivo */
--raziel-soul:    #00d4ff   /* Azul Soul Reaver */
--raziel-text:    #e2e8f0   /* Texto principal */
```

**Animaciones definidas:**
| Clase CSS | Efecto | Duración |
|-----------|--------|----------|
| `avatar-humano` | Borde marrón cálido | estático |
| `avatar-soul-reaver` | Borde azul pulsante | 2.5s loop |
| `transition-to-soul` | Transición siniestra A→B | 1.4s |
| `transition-to-human` | Transición B→A | 1.2s |
| `soul-alive` | Float + breathe continuo | 4s/3s loop |
| `soul-scanlines` | Líneas horizontales | 8s loop |
| `eye-glow` | Parpadeo de ojos | 3s loop |
| `human-idle` | Respiración sutil humano | 5s loop |
| `lipsync-open` | Glow boca al hablar | 120ms |
| `speaking-ring` | Anillo exterior al hablar | 0.7s loop |
| `msg-appear` | Fade-in de mensajes | 0.3s |
| `dot-bounce` | Typing indicator | 1.2s loop |

---

### FASE 8: Integración de los 7 Repos

**¿Cómo se integran?** Los repos no se importan como código — se usan como **base de conocimiento** en el system prompt. Raziel "sabe" lo que contienen porque ese conocimiento está destilado en `system-prompt.ts`.

| Repo | Conocimiento integrado |
|------|----------------------|
| `arquitectura-de-marketing-plantilla-main` | 7 módulos: avatar, oferta (Hormozi), comunicación, contenido, branding, embudo, agente estrategia |
| `saas-finance-kit-main` | KPIs, transacciones, gastos recurrentes, reportes, agente CFO |
| `business-os-template-main` | Mission Control, Agent Server, Finance OS, Telegram bot |
| `mimir-son` | Evaluación de vulnerabilidades, auditoría de seguridad, reportes por severidad |
| `SaaS-legal` | 16 factores de riesgo, 15 plantillas legales, LFPDPPP 2026, protección IP |
| `saas-propuesta-pro` | Formulario 3 etapas, propuesta tecnológica personalizada, generación PDF |
| `mode` | 3 modos de despliegue (CLOUD/LOCAL/VPS), checklist de documentación por tipo |

---

## Variables de Entorno

```bash
# .env.local (NUNCA committear)
ANTHROPIC_API_KEY=sk-ant-api03-...     # API key de Anthropic

# Futuro (cuando se active Neon)
DATABASE_URL=postgresql://...@neon.tech/raziel?sslmode=require
```

---

## Comandos

```bash
npm run dev      # Desarrollo (Turbopack) — corre en puerto 3003
npm run build    # Build de producción
npm run start    # Servidor de producción
npx tsc --noEmit # Verificar tipos TypeScript
```

---

## Limitaciones Conocidas

| Limitación | Detalle |
|------------|---------|
| Lip sync | Usa `onboundary` — soporte completo solo en Chrome |
| Voz | Web Speech API — depende de voces instaladas en el OS |
| Modo local | Solo funciona en navegadores con JS (no SSR) |
| Imágenes avatar | Deben colocarse manualmente en `public/avatars/` |
| Sin auth | No hay autenticación actualmente — acceso abierto local |
| Sin DB activa | Neon está configurado pero no hay tablas/queries activos |

---

## Historial de Decisiones

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Anthropic directo | OpenRouter | Usuario tiene API key de Anthropic |
| Neon | Supabase | Usuario prefiere Neon para todos sus proyectos |
| Web Speech API | ElevenLabs / Google TTS | Sin costo adicional, funciona offline |
| `[ESTADO:*]` como marcador | Tool calls / structured output | Más simple, funciona con streaming puro |
| CSS animations | Framer Motion | Menos dependencias, mayor control |
| `useChat` de Vercel AI SDK | Fetch manual | Maneja streaming, estado y errores automáticamente |

---

## Próximos Pasos Sugeridos

- [ ] Activar Neon DB para persistir historial de conversaciones
- [ ] Agregar autenticación (NextAuth.js) para acceso seguro
- [ ] Integrar ElevenLabs para voz más realista si se requiere
- [ ] Crear ruta `/legal` que active directamente el módulo SaaS-legal
- [ ] Crear ruta `/propuesta` con el formulario de 3 etapas de saas-propuesta-pro
- [ ] Crear ruta `/auditoria` para el módulo mimir-son
- [ ] Deploy en Vercel con variables de entorno configuradas
- [ ] Agregar más repos de conocimiento al sistema

---

*Documentación generada el 2026-03-21. Raziel — Soul Reaver v1.0.0*
