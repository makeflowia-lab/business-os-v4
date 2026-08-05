'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Save, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Default system prompt del agente
export const DEFAULT_SYSTEM_PROMPT = `Eres un CFO virtual experto en finanzas personales y de negocios.

PERSONALIDAD:
- Profesional pero accesible
- Directo y conciso en tus respuestas
- Proactivo en identificar oportunidades de ahorro
- Cauteloso con recomendaciones de inversion

CAPACIDADES:
- Analizar transacciones y detectar patrones
- Calcular metricas financieras (ROI, margen, punto de equilibrio)
- Recomendar estrategias de ahorro
- Alertar sobre gastos inusuales

FORMATO DE RESPUESTA:
Responde SIEMPRE en formato JSON con la siguiente estructura:
{
  "actions": [
    { "type": "think", "text": "Tu razonamiento interno" },
    { "type": "analyze", "text": "Analisis de datos" },
    { "type": "calculate", "text": "Calculos realizados" },
    { "type": "recommend", "text": "Recomendaciones" },
    { "type": "alert", "text": "Alertas importantes" },
    { "type": "message", "text": "Mensaje final al usuario" }
  ]
}

Usa los tipos de accion apropiados segun el contexto.`

interface AgentPromptEditorProps {
  currentPrompt: string | null
  onSave: (prompt: string | null) => Promise<void>
}

export function AgentPromptEditor({ currentPrompt, onSave }: AgentPromptEditorProps) {
  const [prompt, setPrompt] = useState(currentPrompt || DEFAULT_SYSTEM_PROMPT)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const current = currentPrompt || DEFAULT_SYSTEM_PROMPT
    setHasChanges(prompt !== current)
  }, [prompt, currentPrompt])

  // Validar que el prompt tenga la estructura minima requerida
  const validatePrompt = (text: string): string | null => {
    if (!text.includes('FORMATO DE RESPUESTA')) {
      return 'El prompt debe incluir la seccion "FORMATO DE RESPUESTA"'
    }
    if (!text.includes('actions')) {
      return 'El prompt debe mencionar el formato de "actions" para el agente'
    }
    return null
  }

  const handleSave = async () => {
    const validationError = validatePrompt(prompt)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSaving(true)
    try {
      // Si es igual al default, guardar null
      const toSave = prompt === DEFAULT_SYSTEM_PROMPT ? null : prompt
      await onSave(toSave)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setPrompt(DEFAULT_SYSTEM_PROMPT)
    setError(null)
    setIsSaving(true)
    try {
      await onSave(null)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear')
    } finally {
      setIsSaving(false)
    }
  }

  const isDefault = !currentPrompt || currentPrompt === DEFAULT_SYSTEM_PROMPT

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">System Prompt del CFO Agent</h3>
          <p className="text-sm text-gray-500">
            Personaliza como responde tu asistente financiero
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neu-bg shadow-neu rounded-lg text-xs text-gray-500 hover:shadow-neu-sm transition-shadow"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? 'Editar' : 'Preview'}
          </button>
          {!isDefault && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neu-bg shadow-neu rounded-lg text-xs text-gray-500 hover:shadow-neu-sm transition-shadow disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Default
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {isDefault && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Usando prompt por defecto. Edita para personalizar.
        </div>
      )}

      {showPreview ? (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {prompt}
          </pre>
        </div>
      ) : (
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 bg-neu-bg shadow-neu-inset rounded-xl text-sm text-gray-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Escribe el system prompt del agente..."
        />
      )}

      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
