# Blueprint: CFO Virtual Agent - Bucle Agentico Completo

> Implementacion completa del CFO Virtual con Action Stream, Web Search, Vision Analysis y Historial Supabase.

**Contexto**: Ya tenemos Action Stream funcionando. Este blueprint agrega las capacidades avanzadas.

---

## Estado Actual

- [x] Action Stream pattern implementado
- [x] Selector de modelos (Haiku 4.5, Sonnet 4, GPT-4o)
- [x] Tipos de acciones: think, analyze, calculate, recommend, alert, message
- [x] Streaming SSE funcional
- [x] UI profesional neumorphic
- [x] **Fase 3: Historial Supabase** (implementado 2024-12-14)
- [x] **Fase 5: Memoria del Agente** (implementado 2024-12-17)
- [x] **Fase 6: Data Tools (Query Finanzas)** (implementado 2024-12-17)

---

## Fase 1: Web Search (5 min)

### 1.1 Modificar API Route

```typescript
// src/app/api/agent/route.ts
// AGREGAR: Toggle web search con suffix :online

export async function POST(req: Request) {
  const { prompt, context, model: modelKey, webSearch = false } = await req.json()

  const selectedModel = AGENT_MODELS[modelKey as AgentModelKey] || AGENT_MODELS[DEFAULT_MODEL]

  // Agregar :online si webSearch esta activo
  const modelId = webSearch
    ? \`\${selectedModel.id}:online\`
    : selectedModel.id

  const { textStream } = streamText({
    model: openrouter(modelId),
    // ... resto igual
  })
}
```

### 1.2 Agregar Toggle en UI

```typescript
// src/app/(main)/agent/page.tsx
// AGREGAR: Estado y toggle para web search

const [webSearch, setWebSearch] = useState(false)

// En el fetch:
body: JSON.stringify({ prompt, context, model: selectedModel, webSearch })

// En el header, junto al selector de modelos:
<button
  onClick={() => setWebSearch(!webSearch)}
  className={\`px-3 py-2 rounded-xl text-sm \${
    webSearch ? 'shadow-neu-inset text-blue-600' : 'shadow-neu text-gray-600'
  }\`}
>
  <Globe className="w-4 h-4" />
</button>
```

### Checklist Fase 1
- [ ] API route acepta webSearch param
- [ ] Toggle en UI
- [ ] Indicador visual cuando esta activo

---

## Fase 2: Vision Analysis (15 min)

### 2.1 Agregar Modelo Vision

```typescript
// src/lib/ai/openrouter.ts
// AGREGAR: Modelo de vision

export const AGENT_MODELS = {
  // ... modelos existentes ...
  'vision': {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini Vision',
    provider: 'Google',
    description: 'Analisis de documentos',
    speed: 'fast',
    hasVision: true,
  },
}
```

### 2.2 Hook useImageUpload

```typescript
// src/features/agent/hooks/useImageUpload.ts

'use client'

import { useState, useCallback } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string
  base64: string
}

export function useImageUpload(maxImages = 3) {
  const [images, setImages] = useState<UploadedImage[]>([])

  const addImages = useCallback(async (files: FileList) => {
    const newImages: UploadedImage[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) continue

      const base64 = await fileToBase64(file)
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        base64,
      })
    }

    setImages(prev => [...prev, ...newImages].slice(0, maxImages))
  }, [maxImages])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  return { images, addImages, removeImage, clearImages }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### 2.3 Modificar API para Vision

```typescript
// src/app/api/agent/route.ts
// MODIFICAR: Aceptar imagenes

export async function POST(req: Request) {
  const { prompt, context, model: modelKey, webSearch, images } = await req.json()

  // Si hay imagenes, usar modelo de vision
  const hasImages = images && images.length > 0
  const selectedModel = hasImages
    ? AGENT_MODELS['vision']
    : AGENT_MODELS[modelKey as AgentModelKey] || AGENT_MODELS[DEFAULT_MODEL]

  // Construir mensaje con imagenes
  const userContent = hasImages
    ? [
        ...images.map((img: string) => ({
          type: 'image' as const,
          image: img,
        })),
        { type: 'text' as const, text: prompt },
      ]
    : prompt

  const { textStream } = streamText({
    model: openrouter(selectedModel.id),
    system: SYSTEM_PROMPT + contextMessage,
    messages: [
      { role: 'user', content: userContent },
    ],
    temperature: 0,
  })
}
```

### Checklist Fase 2
- [ ] Modelo vision configurado
- [ ] Hook useImageUpload implementado
- [ ] API acepta imagenes en base64
- [ ] Preview de imagenes en UI
- [ ] Auto-switch a modelo vision cuando hay imagenes

---

## Fase 3: Historial Supabase (20 min)

### 3.1 Schema de Base de Datos

```sql
-- Ejecutar via Supabase MCP o SQL Editor

-- Tabla de sesiones del agente
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva sesion',
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de acciones (reemplaza mensajes tradicionales)
CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('user_message', 'think', 'message', 'analyze', 'calculate', 'recommend', 'alert')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX idx_agent_actions_session_id ON agent_actions(session_id);

-- RLS
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions"
  ON agent_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD actions in own sessions"
  ON agent_actions FOR ALL
  USING (
    session_id IN (
      SELECT id FROM agent_sessions WHERE user_id = auth.uid()
    )
  );
```

### 3.2 Servicio de Historial

```typescript
// src/features/agent/services/historyService.ts

import { createClient } from '@/lib/supabase/client'

export interface AgentSession {
  id: string
  user_id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface AgentActionRecord {
  id: string
  session_id: string
  action_type: string
  content: Record<string, unknown>
  created_at: string
}

const supabase = createClient()

export const agentHistoryService = {
  async listSessions(): Promise<AgentSession[]> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  },

  async createSession(title?: string, model?: string): Promise<AgentSession> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('agent_sessions')
      .insert({
        user_id: user.id,
        title: title || 'Nueva sesion',
        model: model || 'haiku-4.5',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async loadActions(sessionId: string): Promise<AgentActionRecord[]> {
    const { data, error } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async saveAction(
    sessionId: string,
    actionType: string,
    content: Record<string, unknown>
  ): Promise<AgentActionRecord> {
    const { data, error } = await supabase
      .from('agent_actions')
      .insert({ session_id: sessionId, action_type: actionType, content })
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('agent_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    return data
  },

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('agent_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
  },
}
```

### Checklist Fase 3
- [x] Tablas creadas en Supabase (agent_sessions, agent_actions)
- [x] RLS policies configuradas (users CRUD own sessions/actions)
- [x] historyService implementado (src/features/agent/services/historyService.ts)
- [x] useAgentHistory hook funcionando (src/features/agent/hooks/useAgentHistory.ts)
- [x] Sidebar de sesiones (src/features/agent/components/AgentSidebar.tsx)
- [x] Acciones se guardan y cargan correctamente (requiere autenticacion)

---

## Orden de Implementacion Recomendado

1. **Web Search** (5 min) - Modificacion minima, alto impacto
2. **Historial Supabase** (20 min) - Persistencia de sesiones
3. **Vision Analysis** (15 min) - Analisis de documentos financieros

---

## Consideraciones CFO-Especificas

### System Prompt Actualizado para Vision

```typescript
const SYSTEM_PROMPT_VISION = \`Eres un CFO virtual analizando documentos financieros.

Cuando recibas una imagen de:
- Estado de cuenta: Extrae saldo, movimientos, fechas
- Factura: Identifica montos, conceptos, RFC
- Grafica: Interpreta tendencias y patrones
- Recibo: Suma totales, identifica categoria

Responde SIEMPRE en formato JSON con acciones estructuradas.\`
```

### Web Search para Finanzas

```typescript
const SYSTEM_PROMPT_WEB = \`Eres un CFO virtual con acceso a busqueda web.

Usa busqueda web para:
- Tipos de cambio actuales
- Tasas de interes del mercado
- Noticias financieras relevantes
- Regulaciones fiscales actualizadas

Cita las fuentes cuando uses informacion externa.\`
```

---

## Fase 4: Input Bar Mejorada - Vision + Web Search (20 min)

> Botones sutiles debajo del input, previews de imagenes, y soporte Cmd+V

### 4.1 Diseño de la Input Bar

```
┌─────────────────────────────────────────────────────────────┐
│  [img1] [img2] [x]    ← Previews pequeños (si hay imagenes) │
├─────────────────────────────────────────────────────────────┤
│  [____________________input____________________] [Enviar]   │
├─────────────────────────────────────────────────────────────┤
│     [🌐]  [📷]        ← Botones sutiles debajo              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Hook useImageUpload Mejorado

```typescript
// src/features/agent/hooks/useImageUpload.ts

'use client'

import { useState, useCallback, useEffect, RefObject } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string
  base64: string
}

interface UseImageUploadOptions {
  maxImages?: number
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxImages = 3, inputRef } = options
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Procesar archivos (FileList o File[])
  const processFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true)
    const newImages: UploadedImage[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) continue // 10MB max

      const base64 = await fileToBase64(file)
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        base64,
      })
    }

    setImages(prev => [...prev, ...newImages].slice(0, maxImages))
    setIsProcessing(false)
  }, [maxImages])

  // Handler para input file
  const addImages = useCallback(async (files: FileList) => {
    await processFiles(Array.from(files))
  }, [processFiles])

  // Handler para Cmd+V (paste)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        await processFiles(imageFiles)
      }
    }

    // Escuchar en el input o en document
    const target = inputRef?.current || document
    target.addEventListener('paste', handlePaste as EventListener)
    return () => target.removeEventListener('paste', handlePaste as EventListener)
  }, [processFiles, inputRef])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  // Obtener base64 para enviar al API
  const getBase64Images = useCallback(() => {
    return images.map(img => img.base64)
  }, [images])

  return {
    images,
    isProcessing,
    hasImages: images.length > 0,
    addImages,
    removeImage,
    clearImages,
    getBase64Images,
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extraer solo el base64 (sin data:image/...;base64,)
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### 4.3 Componente ImagePreviewBar

```typescript
// src/features/agent/components/ImagePreviewBar.tsx

'use client'

import { X } from 'lucide-react'

interface ImagePreview {
  id: string
  preview: string
}

interface Props {
  images: ImagePreview[]
  onRemove: (id: string) => void
  disabled?: boolean
}

export function ImagePreviewBar({ images, onRemove, disabled }: Props) {
  if (images.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative group w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-neu-sm"
        >
          <img
            src={img.preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <button
              onClick={() => onRemove(img.id)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ))}
      <span className="text-xs text-gray-400 ml-2">
        {images.length}/3 imagenes
      </span>
    </div>
  )
}
```

### 4.4 Componente InputActions

```typescript
// src/features/agent/components/InputActions.tsx

'use client'

import { useRef } from 'react'
import { Globe, ImagePlus } from 'lucide-react'

interface Props {
  webSearch: boolean
  onWebSearchToggle: () => void
  onImageSelect: (files: FileList) => void
  disabled?: boolean
  hasImages?: boolean
}

export function InputActions({
  webSearch,
  onWebSearchToggle,
  onImageSelect,
  disabled,
  hasImages,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onImageSelect(e.target.files)
      e.target.value = '' // Reset para permitir mismo archivo
    }
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {/* Web Search Toggle */}
      <button
        type="button"
        onClick={onWebSearchToggle}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          transition-all disabled:opacity-50
          ${webSearch
            ? 'bg-blue-50 text-blue-600 shadow-neu-inset'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Buscar en web (info actualizada)"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Web</span>
      </button>

      {/* Image Upload */}
      <button
        type="button"
        onClick={handleImageClick}
        disabled={disabled || hasImages}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          transition-all disabled:opacity-50
          ${hasImages
            ? 'bg-green-50 text-green-600 shadow-neu-inset'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Subir imagen (Cmd+V para pegar)"
      >
        <ImagePlus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Imagen</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hint para Cmd+V */}
      <span className="text-[10px] text-gray-300 ml-auto hidden sm:block">
        Cmd+V para pegar
      </span>
    </div>
  )
}
```

### 4.5 Integrar en Agent Page

```typescript
// src/app/(main)/agent/page.tsx
// MODIFICAR: Agregar imports y estados

import { useImageUpload } from '@/features/agent/hooks/useImageUpload'
import { ImagePreviewBar } from '@/features/agent/components/ImagePreviewBar'
import { InputActions } from '@/features/agent/components/InputActions'

// Dentro del componente:
const inputRef = useRef<HTMLTextAreaElement>(null)
const [webSearch, setWebSearch] = useState(false)

const {
  images,
  hasImages,
  isProcessing,
  addImages,
  removeImage,
  clearImages,
  getBase64Images,
} = useImageUpload({ maxImages: 3, inputRef })

// En handleSubmit:
const handleSubmit = async (e: FormEvent) => {
  // ...
  const res = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userMessage,
      context,
      model: selectedModel,
      webSearch,
      images: getBase64Images(), // Agregar imagenes
    }),
  })

  // Limpiar imagenes despues de enviar
  clearImages()
  // ...
}

// En el JSX del input:
<div className="border-t border-gray-200">
  {/* Preview de imagenes */}
  <ImagePreviewBar
    images={images}
    onRemove={removeImage}
    disabled={isStreaming}
  />

  {/* Input principal */}
  <form onSubmit={handleSubmit} className="p-4">
    <div className="flex gap-2">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={hasImages ? "Describe que quieres analizar..." : "Escribe tu consulta..."}
        disabled={isStreaming}
        className="flex-1 px-4 py-3 bg-neu-bg shadow-neu-inset rounded-xl resize-none"
        rows={1}
      />
      <button
        type="submit"
        disabled={isStreaming || (!input.trim() && !hasImages)}
        className="px-6 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50"
      >
        {isStreaming ? '...' : 'Enviar'}
      </button>
    </div>
  </form>

  {/* Acciones debajo del input */}
  <InputActions
    webSearch={webSearch}
    onWebSearchToggle={() => setWebSearch(!webSearch)}
    onImageSelect={addImages}
    disabled={isStreaming}
    hasImages={hasImages}
  />
</div>
```

### 4.6 Modificar API Route

```typescript
// src/app/api/agent/route.ts
// MODIFICAR: Aceptar images y webSearch

export async function POST(req: Request) {
  try {
    const {
      prompt,
      context,
      model: modelKey,
      webSearch = false,
      images = [],
    } = await req.json()

    // Determinar modelo
    const hasImages = images.length > 0
    let selectedModel = AGENT_MODELS[modelKey as AgentModelKey] || AGENT_MODELS[DEFAULT_MODEL]

    // Si hay imagenes, forzar modelo con vision
    if (hasImages) {
      selectedModel = AGENT_MODELS['gpt-4o'] // GPT-4o tiene vision
    }

    // Agregar :online si webSearch activo (no compatible con vision)
    const modelId = webSearch && !hasImages
      ? `${selectedModel.id}:online`
      : selectedModel.id

    // Construir contenido del mensaje
    const userContent = hasImages
      ? [
          ...images.map((base64: string) => ({
            type: 'image' as const,
            image: base64,
          })),
          { type: 'text' as const, text: prompt },
        ]
      : prompt

    // System prompt extendido si hay vision o web
    let systemPrompt = SYSTEM_PROMPT
    if (hasImages) {
      systemPrompt += `\n\nANALISIS DE IMAGEN:
Cuando recibas una imagen:
- Extrae todos los datos numericos visibles
- Identifica fechas, montos, conceptos
- Si es un estado de cuenta: saldo, movimientos, banco
- Si es factura/recibo: total, RFC, concepto
- Si es grafica: interpreta tendencias`
    }
    if (webSearch) {
      systemPrompt += `\n\nBUSQUEDA WEB:
Tienes acceso a busqueda web para informacion actualizada.
- Cita las fuentes cuando uses datos externos
- Indica la fecha de la informacion`
    }

    const contextMessage = context ? `\n\nCONTEXTO FINANCIERO:\n${context}` : ''

    const { textStream } = streamText({
      model: openrouter(modelId),
      system: systemPrompt + contextMessage,
      messages: [
        { role: 'user', content: userContent },
      ],
      temperature: 0,
    })

    // ... resto del streaming igual
  }
}
```

### Checklist Fase 4
- [ ] Hook useImageUpload con soporte Cmd+V
- [ ] ImagePreviewBar componente
- [ ] InputActions componente (botones Web + Imagen)
- [ ] API route acepta images[] y webSearch
- [ ] Auto-switch a GPT-4o cuando hay imagenes
- [ ] Limpiar imagenes despues de enviar
- [ ] Indicadores visuales de estado activo

---

## Fase 5: Memoria del Agente (IMPLEMENTADO 2024-12-17)

> El agente recuerda nombres, preferencias y contexto de la conversacion.

### Implementacion

1. **Frontend**: Funcion `actionsToHistory()` convierte acciones a mensajes
2. **API Route**: Recibe `history[]` y lo pasa a `streamText.messages`
3. **System Prompt**: Incluye instruccion de MEMORIA

### Archivos Modificados

```
src/app/(main)/agent/page.tsx  # actionsToHistory() + history en fetch
src/app/api/agent/route.ts     # history param + previousMessages
```

### Codigo Clave

```typescript
// Frontend: Convertir acciones a historial
function actionsToHistory(actions: AgentAction[]) {
  return actions
    .filter(a => a._type === 'user_message' || a._type === 'message')
    .map(a => ({ role: a._type === 'user_message' ? 'user' : 'assistant', content: a.text }))
}

// API: Usar historial previo
const previousMessages = history.slice(-10).map(m => ({ role: m.role, content: m.content }))
streamText({ messages: [...previousMessages, { role: 'user', content: userContent }] })
```

---

## Fase 6: Data Tools - Query Finanzas (IMPLEMENTADO 2024-12-17)

> El agente consulta Supabase automaticamente segun la pregunta.

### Implementacion

- `detectDataNeeds()`: Regex para detectar si necesita datos financieros
- `queryFinances()`: Consulta transacciones por periodo
- `getRecurringExpenses()`: Consulta gastos mensuales

### Patron: Regex Detection vs AI SDK Tools

Para queries read-only predecibles, regex es mas eficiente que tool calling.

---

## Metricas de Exito

- [ ] Usuario puede buscar informacion financiera actualizada (Fase 1 pendiente)
- [ ] Usuario puede subir estados de cuenta para analisis (Fase 2 pendiente)
- [x] Sesiones se guardan y recuperan correctamente (Fase 3 completada)
- [x] Transicion fluida entre sesiones (Fase 3 completada)
- [x] Performance: < 3s para primera respuesta (verificado)
- [ ] Cmd+V pega imagenes del portapapeles (Fase 4 pendiente)
- [ ] Botones sutiles no ocupan espacio extra (Fase 4 pendiente)
- [x] **Agente recuerda nombre del usuario** (Fase 5 completada)
- [x] **Agente consulta datos financieros automaticamente** (Fase 6 completada)

---

## Archivos a Crear (Fase 4)

```
src/features/agent/
├── components/
│   ├── AgentSidebar.tsx        # Ya existe
│   ├── ImagePreviewBar.tsx     # NUEVO: Preview de imagenes
│   └── InputActions.tsx        # NUEVO: Botones Web + Imagen
├── hooks/
│   ├── useAgentHistory.ts      # Ya existe
│   └── useImageUpload.ts       # NUEVO: Hook para imagenes + Cmd+V
└── index.ts                    # Actualizar exports
```

---

## Archivos Implementados (Fase 3)

```
src/features/agent/
├── components/
│   └── AgentSidebar.tsx      # Sidebar con historial de sesiones
├── hooks/
│   └── useAgentHistory.ts    # Hook para gestionar historial
├── services/
│   └── historyService.ts     # CRUD Supabase para sesiones/acciones
└── index.ts                  # Exports actualizados

supabase/migrations/
├── *_create_agent_sessions_table.sql
└── *_create_agent_actions_table.sql
```
