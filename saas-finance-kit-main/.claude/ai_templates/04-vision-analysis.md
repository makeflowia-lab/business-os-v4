# Bloque 04: Vision Analysis

> Analizar imagenes con modelos de vision (Gemini, GPT-4o, Claude).

**Tiempo:** 25 minutos
**Prerequisitos:** Bloque 01 (Chat Streaming)

---

## Que Obtienes

- Upload de imagenes
- Analisis con IA Vision
- Integracion con el chat
- Preview antes de enviar

---

## 1. Modelos con Vision

```typescript
// lib/ai/openrouter.ts
// Agregar modelos de vision

export const MODELS = {
  // ... otros modelos ...

  // Vision (analisis de imagenes)
  vision: 'google/gemini-2.0-flash-exp:free',  // Gratis, bueno
  visionPro: 'openai/gpt-4o',                   // Mejor calidad
  visionClaude: 'anthropic/claude-3-5-sonnet',  // Alternativa
} as const
```

---

## 2. API Route con Vision

```typescript
// app/api/chat/route.ts
// MODIFICAR: Agregar soporte para imagenes

import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

const SYSTEM_PROMPT = `Eres un asistente que puede analizar imagenes.
Cuando recibas una imagen:
1. Describe lo que ves
2. Responde preguntas sobre el contenido
3. Extrae informacion relevante`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Detectar si hay imagenes en el ultimo mensaje
  const lastMessage = messages[messages.length - 1]
  const hasImages = lastMessage?.parts?.some(
    (part) => part.type === 'image'
  )

  // Usar modelo de vision si hay imagenes
  const model = hasImages ? MODELS.vision : MODELS.balanced

  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(model),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
```

---

## 3. Hook useImageUpload

```typescript
// features/chat/hooks/useImageUpload.ts

'use client'

import { useState, useCallback } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string  // Data URL para preview
  base64: string   // Para enviar al modelo
}

export function useImageUpload(maxImages = 5) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addImages = useCallback(async (files: FileList) => {
    setIsProcessing(true)

    const newImages: UploadedImage[] = []

    for (const file of Array.from(files)) {
      // Validar tipo
      if (!file.type.startsWith('image/')) continue

      // Validar tamanio (max 5MB)
      if (file.size > 5 * 1024 * 1024) continue

      // Convertir a base64
      const base64 = await fileToBase64(file)

      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        base64,
      })
    }

    setImages((prev) => {
      const combined = [...prev, ...newImages]
      return combined.slice(0, maxImages)  // Limitar cantidad
    })

    setIsProcessing(false)
  }, [maxImages])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const clearImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  // Obtener imagenes en formato para el SDK
  const getImageParts = useCallback(() => {
    return images.map((img) => ({
      type: 'image' as const,
      image: img.base64,
    }))
  }, [images])

  return {
    images,
    isProcessing,
    addImages,
    removeImage,
    clearImages,
    getImageParts,
  }
}

// Helper: File a base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extraer solo el base64 (sin el prefijo data:image/...)
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

---

## 4. Componente ImageUploader

```typescript
// features/chat/components/ImageUploader.tsx

'use client'

import { useRef } from 'react'

interface UploadedImage {
  id: string
  preview: string
}

interface Props {
  images: UploadedImage[]
  onAdd: (files: FileList) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export function ImageUploader({ images, onAdd, onRemove, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onAdd(e.target.files)
      e.target.value = ''  // Reset para permitir mismo archivo
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Previews */}
      {images.map((img) => (
        <div key={img.id} className="relative">
          <img
            src={img.preview}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg"
          />
          <button
            onClick={() => onRemove(img.id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
          >
            x
          </button>
        </div>
      ))}

      {/* Boton agregar */}
      {images.length < 5 && (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50"
        >
          +
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
```

---

## 5. Integrar con Chat

```typescript
// features/chat/components/ChatWithVision.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { useImageUpload } from '../hooks/useImageUpload'
import { ImageUploader } from './ImageUploader'

export function ChatWithVision() {
  const { messages, status, sendMessage } = useChat()
  const { images, addImages, removeImage, clearImages, getImageParts } = useImageUpload()
  const [input, setInput] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && images.length === 0) || isLoading) return

    const text = input.trim()
    setInput('')

    // Construir mensaje con texto e imagenes
    const parts: any[] = []

    // Agregar imagenes primero
    parts.push(...getImageParts())

    // Agregar texto
    if (text) {
      parts.push({ type: 'text', text })
    }

    // Enviar mensaje con parts
    sendMessage({
      text: text || 'Analiza esta imagen',
      experimental_attachments: images.map((img) => ({
        name: img.file.name,
        contentType: img.file.type,
        url: img.preview,
      })),
    })

    clearImages()
  }

  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts) return ''
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {/* Mostrar imagenes si las hay */}
              {m.experimental_attachments?.map((att, i) => (
                <img
                  key={i}
                  src={att.url}
                  alt="Attached"
                  className="max-w-full rounded-lg mb-2"
                />
              ))}
              {getMessageText(m)}
            </div>
          </div>
        ))}
      </div>

      {/* Input con imagenes */}
      <div className="p-4 border-t space-y-3">
        {/* Preview de imagenes */}
        {images.length > 0 && (
          <ImageUploader
            images={images}
            onAdd={addImages}
            onRemove={removeImage}
            disabled={isLoading}
          />
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* Boton agregar imagen */}
          {images.length === 0 && (
            <label className="px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && addImages(e.target.files)}
                className="hidden"
              />
              <span>📷</span>
            </label>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={images.length > 0 ? "Pregunta sobre la imagen..." : "Escribe o sube una imagen..."}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && images.length === 0)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## Alternativa: Subir a Supabase Storage

Si quieres guardar las imagenes permanentemente:

```typescript
// features/chat/services/storageService.ts

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file)

  if (error) throw error

  // Obtener URL publica
  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(data.path)

  return publicUrl
}
```

---

## Checklist

- [ ] Modelo de vision configurado
- [ ] API route detecta imagenes
- [ ] Hook useImageUpload funciona
- [ ] Preview de imagenes antes de enviar
- [ ] Imagenes se envian y analizan correctamente

---

## Siguiente Bloque

- **Agregar tools**: `05-tools-funciones.md`
