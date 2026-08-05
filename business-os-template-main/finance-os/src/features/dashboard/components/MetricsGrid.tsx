'use client'

import { CalculatedMetrics } from '@/features/calculator/types'
import { MetricCard } from './MetricCard'

interface MetricsGridProps {
  metrics: CalculatedMetrics
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const survivalMetrics = [
    metrics.netProfitMargin,
    metrics.breakEvenPoint,
    metrics.runwayDays,
  ]

  const growthMetrics = [
    metrics.retentionRate,
    metrics.cac,
    metrics.ltv,
    metrics.ltvCacRatio,
  ]

  const efficiencyMetrics = [
    metrics.revenuePerEmployee,
    metrics.laborCostRatio,
    metrics.wasteImpact,
  ]

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">🩺</span> Supervivencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {survivalMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span> Crecimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {growthMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Eficiencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {efficiencyMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>
    </div>
  )
}
