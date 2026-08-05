'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState, useMemo, FormEvent } from 'react'
import { NeuCard } from '@/shared/components/ui'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { useCalculatorStore } from '@/features/calculator/store/calculatorStore'
import { useFinancesStore } from '@/features/finances/store/financesStore'
import { buildContextFromStores } from '@/features/finances/services/context'

export function EnhancedChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  // Calculator store
  const { metrics, inputs } = useCalculatorStore()

  // Finances store
  const { transactions, gastosMensuales, gastosAnuales, kpis } = useFinancesStore()

  // Build enriched context
  const context = useMemo(() => {
    const calculatorData = metrics ? { metrics, inputs } : null
    const financesData =
      transactions.length > 0 || gastosMensuales.length > 0 || gastosAnuales.length > 0
        ? { kpis, transactions, gastosMensuales, gastosAnuales }
        : null

    return buildContextFromStores(calculatorData, financesData)
  }, [metrics, inputs, transactions, gastosMensuales, gastosAnuales, kpis])

  const businessName = inputs.businessName || 'tu negocio'

  const welcomeContent = `Hola! Soy tu Virtual CFO 🤖

He analizado los datos de ${businessName}. ${
    transactions.length > 0
      ? `Veo que tienes ${transactions.length} transacciones registradas.`
      : 'Aun no tienes transacciones registradas.'
  }

Puedo ayudarte a:
• Entender tus metricas financieras
• Analizar tus gastos por categoria
• Identificar oportunidades de ahorro
• Proyectar escenarios futuros
• Revisar tus gastos recurrentes

¿En que puedo ayudarte hoy?`

  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text: welcomeContent }],
  }

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { context },
      }),
    [context]
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [welcomeMessage],
    onError: (err) => {
      console.error('Chat error:', err)
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    await sendMessage({ text: userMessage })
  }

  return (
    <NeuCard size="lg" className="flex flex-col h-[600px]">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-neu-bg shadow-neu rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Virtual CFO</h3>
          <p className="text-xs text-gray-500">
            Powered by Gemini
            {transactions.length > 0 && (
              <span className="ml-2 text-emerald-600">
                • {transactions.length} transacciones
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Error: {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Pregunta sobre tus finanzas..."
        />
      </div>
    </NeuCard>
  )
}
