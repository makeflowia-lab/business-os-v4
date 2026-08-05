'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState, useMemo, FormEvent } from 'react'
import { NeuCard } from '@/shared/components/ui'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { CalculatedMetrics, FinancialInputs } from '@/features/calculator/types'

interface ChatInterfaceProps {
  metrics: CalculatedMetrics
  inputs: FinancialInputs
}

function buildContext(metrics: CalculatedMetrics, inputs: FinancialInputs): string {
  return `
Nombre del negocio: ${inputs.businessName || 'Sin nombre'}
Industria: ${inputs.industry}
Ingresos mensuales: $${inputs.monthlyRevenue.toLocaleString()}
Gastos fijos: $${inputs.fixedCosts.toLocaleString()}
Gastos variables: $${inputs.variableCosts.toLocaleString()}
Efectivo disponible: $${inputs.currentCash.toLocaleString()}
Empleados: ${inputs.totalEmployees}
Nómina mensual: $${inputs.totalPayroll.toLocaleString()}

MÉTRICAS CALCULADAS:
- Margen de beneficio neto: ${metrics.netProfitMargin.formattedValue} (${metrics.netProfitMargin.status})
- Punto de equilibrio: ${metrics.breakEvenPoint.formattedValue} (${metrics.breakEvenPoint.status})
- Runway: ${metrics.runwayDays.formattedValue} (${metrics.runwayDays.status})
- Retención de clientes: ${metrics.retentionRate.formattedValue} (${metrics.retentionRate.status})
- CAC: ${metrics.cac.formattedValue} (${metrics.cac.status})
- LTV: ${metrics.ltv.formattedValue} (${metrics.ltv.status})
- Ratio LTV:CAC: ${metrics.ltvCacRatio.formattedValue} (${metrics.ltvCacRatio.status})
- Ingreso por empleado: ${metrics.revenuePerEmployee.formattedValue} (${metrics.revenuePerEmployee.status})
- Ratio costo laboral: ${metrics.laborCostRatio.formattedValue} (${metrics.laborCostRatio.status})
- Impacto de merma: ${metrics.wasteImpact.formattedValue} (${metrics.wasteImpact.status})
  `.trim()
}

export function ChatInterface({ metrics, inputs }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const context = buildContext(metrics, inputs)

  const welcomeContent = `¡Hola! Soy tu Virtual CFO 🤖

He analizado los datos de ${inputs.businessName || 'tu negocio'}. Estoy aquí para ayudarte a:

• Entender qué significan tus métricas
• Compararte con tu industria
• Identificar oportunidades de mejora
• Simular escenarios ("¿qué pasa si...?")

¿En qué puedo ayudarte hoy?`

  // AI SDK v5: UIMessage only has parts, not content
  const welcomeMessage = {
    id: 'welcome',
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text: welcomeContent }],
  }

  // AI SDK v5: Use transport instead of api/body
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: { context },
  }), [context])

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [welcomeMessage],
    onError: (err) => {
      console.error('❌ Chat error:', err)
    },
  })

  // Debug: log messages and errors
  useEffect(() => {
    console.log('📨 Messages:', messages)
    console.log('📊 Status:', status)
    if (error) console.error('❌ Error state:', error)
  }, [messages, status, error])

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // AI SDK v5: Use text instead of role/content
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
          <p className="text-xs text-gray-500">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder="Pregunta sobre tus métricas..."
        />
      </div>
    </NeuCard>
  )
}
