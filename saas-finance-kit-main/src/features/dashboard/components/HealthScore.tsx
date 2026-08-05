'use client'

import { NeuCard, NeuProgress } from '@/shared/components/ui'
import { MetricStatus } from '@/features/calculator/types'

interface HealthScoreProps {
  score: number
  status: MetricStatus
  summary: string
  businessName?: string
}

export function HealthScore({ score, status, summary, businessName }: HealthScoreProps) {
  const statusEmoji = {
    critical: '🚨',
    warning: '⚠️',
    healthy: '✅',
  }

  const progressVariant = {
    critical: 'danger' as const,
    warning: 'warning' as const,
    healthy: 'success' as const,
  }

  return (
    <NeuCard size="lg" className="text-center">
      <div className="mb-4">
        <span className="text-4xl">{statusEmoji[status]}</span>
      </div>

      {businessName && (
        <p className="text-sm text-gray-500 mb-2">Diagnóstico de</p>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {businessName || 'Tu Negocio'}
      </h2>

      <div className="max-w-xs mx-auto my-6">
        <NeuProgress
          value={score}
          variant={progressVariant[status]}
          size="lg"
        />
      </div>

      <p className="text-3xl font-bold text-gray-700 mb-2">
        {score}/100
      </p>
      <p className={`text-lg font-medium ${
        status === 'critical' ? 'text-red-600' :
        status === 'warning' ? 'text-amber-600' :
        'text-emerald-600'
      }`}>
        {summary}
      </p>
    </NeuCard>
  )
}
