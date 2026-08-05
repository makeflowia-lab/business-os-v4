'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/features/calculator'
import { MetricsGrid } from '@/features/dashboard'
import { ChatInterface } from '@/features/agent'
import { NeuButton } from '@/shared/components/ui'

export default function DashboardPage() {
  const router = useRouter()
  const { metrics, inputs, reset } = useCalculatorStore()
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!metrics) {
      router.push('/')
    }
  }, [metrics, router])

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  const handleReset = () => {
    reset()
    router.push('/')
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">
              Mission Control
            </h1>
            <p className="text-gray-500">
              Diagnóstico financiero completo
            </p>
          </div>
          <div className="flex gap-3">
            <NeuButton
              variant={showChat ? 'primary' : 'secondary'}
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? 'Ocultar CFO' : '🤖 Consultar CFO'}
            </NeuButton>
            <NeuButton variant="secondary" onClick={handleReset}>
              Nuevo Análisis
            </NeuButton>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`${showChat ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
            <MetricsGrid metrics={metrics} />
          </div>

          {showChat && (
            <div className="lg:w-1/3 lg:sticky lg:top-8 lg:self-start">
              <ChatInterface metrics={metrics} inputs={inputs} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
