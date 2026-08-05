'use client'

import { useRef, useEffect, useState, useCallback, FormEvent } from 'react'
import {
  Bot,
  Send,
  TrendingUp,
  PiggyBank,
  Calculator,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Menu,
  Globe,
  ImagePlus,
  Eye,
  EyeOff,
} from 'lucide-react'
import { NeuCard } from '@/shared/components/ui'
import { AGENT_MODELS, DEFAULT_MODEL, type AgentModelKey } from '@/lib/ai/models'
import { useFinancesStore } from '@/features/finances/store/financesStore'
import { useCalculatorStore } from '@/features/calculator'
import { buildContextFromStores } from '@/features/finances/services/context'
import { useAgentHistory } from '@/features/agent/hooks/useAgentHistory'
import { useImageUpload } from '@/features/agent/hooks/useImageUpload'
import { AgentSidebar } from '@/features/agent/components/AgentSidebar'
import { ImagePreviewBar } from '@/features/agent/components/ImagePreviewBar'
import { useAgentSidebar } from '@/shared/context/AgentSidebarContext'

// Tipos para las acciones del agente
type ActionType = 'think' | 'message' | 'user_message' | 'calculate' | 'recommend' | 'alert' | 'analyze'

// Set de tipos válidos para validación
const VALID_ACTION_TYPES = new Set<ActionType>(['think', 'message', 'user_message', 'calculate', 'recommend', 'alert', 'analyze'])
type Severity = 'info' | 'warning' | 'critical'
type Priority = 'high' | 'medium' | 'low'
type Status = 'good' | 'warning' | 'critical'

interface BaseAction {
  _type: ActionType
  complete: boolean
}

interface ThinkAction extends BaseAction {
  _type: 'think'
  text: string
}

interface MessageAction extends BaseAction {
  _type: 'message'
  text: string
}

interface UserMessageAction extends BaseAction {
  _type: 'user_message'
  text: string
}

interface CalculateAction extends BaseAction {
  _type: 'calculate'
  label: string
  formula: string
  result: number
  unit?: string
}

interface RecommendAction extends BaseAction {
  _type: 'recommend'
  priority: Priority
  title: string
  description: string
  impact: string
}

interface AlertAction extends BaseAction {
  _type: 'alert'
  severity: Severity
  message: string
}

interface AnalyzeAction extends BaseAction {
  _type: 'analyze'
  metric: string
  value: number
  status: Status
  insight: string
}

type AgentAction = ThinkAction | MessageAction | UserMessageAction | CalculateAction | RecommendAction | AlertAction | AnalyzeAction

// Sugerencias rapidas
const quickSuggestions = [
  { icon: TrendingUp, text: 'Analiza mi flujo de caja', color: 'text-emerald-600' },
  { icon: PiggyBank, text: 'Donde puedo reducir gastos?', color: 'text-blue-600' },
  { icon: Calculator, text: 'Proyecta mis finanzas a 6 meses', color: 'text-purple-600' },
]

// Convertir acciones a historial de mensajes para memoria
function actionsToHistory(actions: AgentAction[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const action of actions) {
    if (action._type === 'user_message' && action.text?.trim()) {
      history.push({ role: 'user', content: action.text })
    } else if (action._type === 'message' && action.text?.trim()) {
      history.push({ role: 'assistant', content: action.text })
    }
  }

  return history
}

export default function AgentPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [actions, setActions] = useState<AgentAction[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AgentModelKey>(DEFAULT_MODEL)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const [showDetails, setShowDetails] = useState(true) // Toggle para mostrar/ocultar pasos intermedios

  // Sidebar state from layout context
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen } = useAgentSidebar()

  // Image upload hook
  const {
    images,
    hasImages,
    addImages,
    removeImage,
    clearImages,
    getBase64Images,
  } = useImageUpload({ maxImages: 3, inputRef: textareaRef })

  // Historial de sesiones
  const {
    sessions,
    currentSessionId,
    currentSession,
    isLoading: isLoadingHistory,
    saveActions,
    selectSession,
    deleteSession,
    startNewConversation,
    updateTitle,
  } = useAgentHistory()

  // Stores para contexto
  const { metrics, inputs } = useCalculatorStore()
  const { transactions, gastosMensuales, gastosAnuales, kpis } = useFinancesStore()

  // Construir contexto
  const buildContext = useCallback(() => {
    const calculatorData = metrics ? { metrics, inputs } : null
    const financesData =
      transactions.length > 0 || gastosMensuales.length > 0 || gastosAnuales.length > 0
        ? { kpis, transactions, gastosMensuales, gastosAnuales }
        : null
    return buildContextFromStores(calculatorData, financesData)
  }, [metrics, inputs, transactions, gastosMensuales, gastosAnuales, kpis])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [actions])

  // Mensaje de bienvenida solo cuando no hay sesion cargada
  useEffect(() => {
    if (actions.length === 0 && !currentSessionId) {
      const hasData = transactions.length > 0 || metrics
      setActions([
        {
          _type: 'think',
          text: hasData
            ? 'Conectado a tus datos financieros. Listo para analizar.'
            : 'Sin datos financieros cargados. Puedo responder preguntas generales.',
          complete: true,
        },
        {
          _type: 'message',
          text: `CFO Virtual activo. ${hasData ? `Detectadas ${transactions.length} transacciones.` : ''} Cada analisis mostrara el razonamiento completo paso a paso.`,
          complete: true,
        },
      ])
    }
  }, [actions.length, transactions.length, metrics, currentSessionId])

  // Cargar acciones cuando se selecciona una sesion
  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      const loadedActions = await selectSession(sessionId)
      // Convertir las acciones de DB a acciones de UI
      const uiActions: AgentAction[] = loadedActions.map((record) => ({
        ...record.content,
        _type: record.action_type,
        complete: true,
      } as AgentAction))
      setActions(uiActions)
    } catch (err) {
      console.error('Error loading session:', err)
    }
  }, [selectSession])

  // Nueva sesion
  const handleNewSession = useCallback(() => {
    startNewConversation()
    const hasData = transactions.length > 0 || metrics
    setActions([
      {
        _type: 'think',
        text: hasData
          ? 'Conectado a tus datos financieros. Listo para analizar.'
          : 'Sin datos financieros cargados. Puedo responder preguntas generales.',
        complete: true,
      },
      {
        _type: 'message',
        text: `CFO Virtual activo. ${hasData ? `Detectadas ${transactions.length} transacciones.` : ''} Nueva sesion iniciada.`,
        complete: true,
      },
    ])
  }, [startNewConversation, transactions.length, metrics])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !hasImages) || isStreaming) return

    const userMessage = input.trim()
    const imagesToSend = getBase64Images()
    setInput('')
    clearImages()

    // Añadir mensaje del usuario
    const userAction: UserMessageAction = {
      _type: 'user_message',
      text: userMessage || (imagesToSend.length > 0 ? `[${imagesToSend.length} imagen(es) adjunta(s)]` : ''),
      complete: true,
    }
    setActions((prev) => [...prev, userAction])

    setIsStreaming(true)

    // Acciones a guardar al final
    const actionsToSave: AgentAction[] = [userAction]

    try {
      const context = buildContext()
      // Convertir acciones previas a historial para memoria
      const history = actionsToHistory(actions)

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          context,
          model: selectedModel,
          webSearch,
          images: imagesToSend,
          history,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/)
          if (!match) continue
          if (match[1] === '[DONE]') break

          try {
            const action = JSON.parse(match[1]) as AgentAction

            // Guardar accion completada para persistir
            if (action.complete) {
              actionsToSave.push(action)
            }

            setActions((prev) => {
              if (prev.length > 0) {
                const last = prev[prev.length - 1]
                if (!last.complete && last._type === action._type) {
                  return [...prev.slice(0, -1), action]
                }
              }
              return [...prev, action]
            })
          } catch (parseError) {
            console.error('Parse error:', parseError)
          }
        }
      }

      // Guardar todas las acciones en Supabase
      if (actionsToSave.length > 0) {
        try {
          await saveActions(
            actionsToSave.map((a) => ({
              actionType: a._type,
              content: { ...a },
            }))
          )

          // Auto-generar titulo de la primera pregunta del usuario
          if (!currentSession?.title || currentSession.title === 'Nueva sesion') {
            const titleFromMessage = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
            updateTitle(titleFromMessage)
          }
        } catch (saveErr) {
          console.error('Error saving actions:', saveErr)
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      const errorAction: AlertAction = {
        _type: 'alert',
        severity: 'critical',
        message: `Error de conexion: ${String(error)}`,
        complete: true,
      }
      setActions((prev) => [...prev, errorAction])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleQuickSuggestion = (text: string) => {
    setInput(text)
  }

  const currentModel = AGENT_MODELS[selectedModel]

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <AgentSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isLoading={isLoadingHistory}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Main Content - Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto">
          {/* Messages Area - Solo esta area tiene scroll */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {actions
              .filter((action) => {
                // 1. Rechazar acciones con _type no válido
                if (!VALID_ACTION_TYPES.has(action._type)) return false

                // 2. Filtrar acciones vacías según su tipo
                if (action._type === 'message' && !(action as MessageAction).text?.trim()) return false
                if (action._type === 'think' && !(action as ThinkAction).text?.trim()) return false
                if (action._type === 'analyze' && !(action as AnalyzeAction).metric?.trim()) return false
                if (action._type === 'calculate' && !(action as CalculateAction).label?.trim()) return false
                if (action._type === 'recommend' && !(action as RecommendAction).title?.trim()) return false
                if (action._type === 'alert' && !(action as AlertAction).message?.trim()) return false
                if (action._type === 'user_message' && !(action as UserMessageAction).text?.trim()) return false

                // 3. Modo compacto: ocultar pasos intermedios
                if (!showDetails && ['think', 'analyze', 'calculate'].includes(action._type)) return false

                return true
              })
              .map((action, idx) => (
                <ActionItem key={idx} action={action} />
              ))}

            {isStreaming && (
              <div className="flex items-center gap-2 text-gray-400 pl-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Procesando con {currentModel.name}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - Ocultas en mobile */}
          {actions.length <= 2 && (
            <div className="hidden md:block px-3 pb-2">
              <p className="text-[11px] text-gray-400 mb-1.5">Consultas frecuentes</p>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickSuggestion(suggestion.text)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-neu-bg shadow-neu rounded-lg text-[11px] text-gray-600 hover:shadow-neu-sm transition-all"
                  >
                    <suggestion.icon className={`w-3 h-3 ${suggestion.color}`} />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Fijo al fondo */}
          <div className="border-t border-gray-200/50 bg-neu-bg px-3 py-2">
            {/* Image Preview Bar */}
            <ImagePreviewBar
              images={images}
              onRemove={removeImage}
              disabled={isStreaming}
            />

            <form onSubmit={handleSubmit}>
              <div className="bg-white/50 rounded-xl shadow-neu-inset p-1.5">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder={hasImages ? 'Describe que quieres analizar...' : 'Escribe tu consulta...'}
                  disabled={isStreaming}
                  rows={1}
                  className="w-full bg-transparent resize-none px-2 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none disabled:opacity-50"
                />
                <div className="flex items-center justify-between px-0.5">
                  {/* Left: Model Selector + Web Search + Image */}
                  <div className="flex items-center gap-0.5">
                    {/* Model Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setModelMenuOpen(!modelMenuOpen)}
                        onBlur={() => setTimeout(() => setModelMenuOpen(false), 150)}
                        className="flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors"
                      >
                        <Zap className={`w-3 h-3 ${currentModel.speed === 'fast' ? 'text-amber-500' : 'text-blue-500'}`} />
                        <span className="hidden sm:inline">{currentModel.name}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {modelMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                          {(Object.keys(AGENT_MODELS) as AgentModelKey[]).map((key) => {
                            const model = AGENT_MODELS[key]
                            const isSelected = key === selectedModel
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setSelectedModel(key)
                                  setModelMenuOpen(false)
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                                  isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                                }`}
                              >
                                <Zap className={`w-3 h-3 ${model.speed === 'fast' ? 'text-amber-500' : 'text-blue-500'}`} />
                                <div className="flex-1">
                                  <p className="font-medium">{model.name}</p>
                                  <p className="text-gray-400 text-[10px]">{model.provider}</p>
                                </div>
                                {isSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Web Search Toggle */}
                    <button
                      type="button"
                      onClick={() => setWebSearch(!webSearch)}
                      disabled={isStreaming}
                      className={`p-1 rounded-md transition-colors disabled:opacity-50 ${
                        webSearch
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                      }`}
                      title="Buscar en web"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    {/* Image Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isStreaming}
                      className={`p-1 rounded-md transition-colors disabled:opacity-50 ${
                        hasImages
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                      }`}
                      title="Subir imagen"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          addImages(e.target.files)
                          e.target.value = ''
                        }
                      }}
                      className="hidden"
                    />

                    {/* Separador */}
                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    {/* Show Details Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className={`p-1 rounded-md transition-colors ${
                        showDetails
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                      }`}
                      title={showDetails ? 'Ocultar pasos intermedios' : 'Mostrar pasos intermedios'}
                    >
                      {showDetails ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Right: Submit Button */}
                  <button
                    type="submit"
                    disabled={(!input.trim() && !hasImages) || isStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neu-bg rounded-lg shadow-neu hover:shadow-neu-inset text-blue-600 font-medium text-[11px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStreaming ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="hidden sm:inline">Analizando...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Enviar</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
      </div>
    </div>
  )
}

// Componente colapsable para "think"
// Diseño minimalista: el pensamiento es secundario, no debe competir con el mensaje
function ThinkItem({ text, complete }: { text?: string; complete: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const content = text?.trim() || 'Procesando...'

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`
        group w-full text-left transition-all duration-200 ease-out
        ${!complete ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className={`
        flex items-start gap-2 py-1 px-2 rounded-lg
        transition-all duration-200
        ${expanded ? 'bg-gray-50/60' : 'hover:bg-gray-50/40'}
      `}>
        {/* Indicador minimalista */}
        <ChevronRight
          className={`
            w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5
            transition-transform duration-200
            ${expanded ? 'rotate-90 text-gray-400' : 'group-hover:text-gray-400'}
          `}
        />

        {expanded ? (
          // Expandido: muestra el razonamiento completo
          <p className="text-xs text-gray-400 italic leading-relaxed">
            {content}
          </p>
        ) : (
          // Colapsado: indicador sutil
          <span className="text-[11px] text-gray-300 italic group-hover:text-gray-400 transition-colors">
            pensando...
          </span>
        )}
      </div>
    </button>
  )
}

// Componente para renderizar cada accion
function ActionItem({ action }: { action: AgentAction }) {
  const baseClasses = `transition-opacity ${!action.complete ? 'opacity-60' : ''}`

  switch (action._type) {
    case 'user_message':
      return (
        <div className="flex justify-end">
          <div className="max-w-[80%] px-5 py-3 bg-blue-500 text-white rounded-2xl rounded-br-sm">
            <p className="text-sm">{action.text}</p>
          </div>
        </div>
      )

    case 'think':
      return <ThinkItem text={action.text} complete={action.complete} />

    case 'analyze':
      const statusColors = {
        good: 'bg-emerald-500',
        warning: 'bg-amber-500',
        critical: 'bg-red-500',
      }
      const statusBg = {
        good: 'bg-emerald-50',
        warning: 'bg-amber-50',
        critical: 'bg-red-50',
      }
      const safeStatus = action.status || 'good'
      return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl ${statusBg[safeStatus]} ${baseClasses}`}>
          <div className={`w-6 h-6 ${statusColors[safeStatus]} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{action.metric || 'Metrica'}</p>
              <p className="text-lg font-bold text-gray-800">
                {typeof action.value === 'number' ? action.value.toLocaleString('es-MX') : (action.value ?? '-')}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{action.insight || ''}</p>
          </div>
        </div>
      )

    case 'calculate':
      return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50/80 ${baseClasses}`}>
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calculator className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{action.label || 'Calculo'}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{action.formula || ''}</p>
            <p className="text-lg font-bold text-blue-600 mt-1">
              = {typeof action.result === 'number' ? action.result.toLocaleString('es-MX') : (action.result ?? '-')} {action.unit || ''}
            </p>
          </div>
        </div>
      )

    case 'recommend':
      const priorityColors = {
        high: 'border-l-red-500 bg-red-50/50',
        medium: 'border-l-amber-500 bg-amber-50/50',
        low: 'border-l-blue-500 bg-blue-50/50',
      }
      const priorityLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja',
      }
      const safePriority = action.priority || 'medium'
      return (
        <div className={`border-l-4 ${priorityColors[safePriority]} px-4 py-3 rounded-r-xl ${baseClasses}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              safePriority === 'high' ? 'bg-red-100 text-red-700' :
              safePriority === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              Prioridad {priorityLabels[safePriority]}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{action.title || 'Recomendacion'}</p>
          <p className="text-sm text-gray-600 mt-1">{action.description || ''}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Impacto: {action.impact || '-'}</p>
        </div>
      )

    case 'alert':
      const severityStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        critical: 'bg-red-50 border-red-200 text-red-800',
      }
      const severityIndicator = {
        info: 'bg-blue-500',
        warning: 'bg-amber-500 animate-pulse',
        critical: 'bg-red-500 animate-pulse',
      }
      return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${severityStyles[action.severity] || severityStyles.info} ${baseClasses}`}>
          <div className={`w-3 h-3 ${severityIndicator[action.severity] || severityIndicator.info} rounded-full flex-shrink-0 mt-1`} />
          <p className="text-sm font-medium">{action.message?.trim() || 'Alerta'}</p>
        </div>
      )

    case 'message':
      const messageText = (action as MessageAction).text?.trim()
      if (!messageText) return null // No renderizar si está vacío
      return (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-neu-bg shadow-neu rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`max-w-[85%] px-4 py-3 bg-neu-bg shadow-neu rounded-2xl rounded-bl-sm ${baseClasses}`}>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{messageText}</p>
          </div>
        </div>
      )

    default:
      // Tipo no reconocido - no renderizar
      console.warn('ActionItem: tipo no reconocido', (action as { _type: string })._type)
      return null
  }
}
