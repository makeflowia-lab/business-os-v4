'use client'

import { Metric } from '@/features/calculator/types'
import { NeuCard } from '@/shared/components/ui'
import { StatusIndicator } from './StatusIndicator'

interface MetricCardProps {
  metric: Metric
  onClick?: () => void
}

export function MetricCard({ metric, onClick }: MetricCardProps) {
  return (
    <NeuCard
      className={`cursor-pointer hover:shadow-neu-md transition-shadow duration-200 ${onClick ? 'hover:scale-[1.02]' : ''}`}
      size="sm"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 leading-tight">
          {metric.name}
        </h3>
        <StatusIndicator status={metric.status} />
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-800">
          {metric.formattedValue}
        </p>
      </div>

      {metric.benchmark && (
        <p className="text-xs text-gray-500 mb-2">
          {metric.benchmark}
        </p>
      )}

      {metric.impact && (
        <p className={`text-xs font-medium ${
          metric.status === 'critical' ? 'text-red-600' :
          metric.status === 'warning' ? 'text-amber-600' :
          'text-emerald-600'
        }`}>
          {metric.impact}
        </p>
      )}
    </NeuCard>
  )
}
