'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { getCategoryColor } from '@/lib/categoryColors'
import { CategorySummary } from '../services/analytics'

const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
)

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CategoryDistributionProps {
  data: CategorySummary[]
  title: string
  type: 'ingreso' | 'gasto'
}

export function CategoryDistribution({ data, title, type }: CategoryDistributionProps) {
  const totalAmount = useMemo(
    () => data.reduce((sum, d) => sum + d.total, 0),
    [data]
  )

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.total - a.total)
    return {
      labels: sorted.map((d) => d.categoria),
      datasets: [
        {
          label: 'Monto',
          data: sorted.map((d) => d.total),
          backgroundColor: sorted.map((d) => getCategoryColor(d.categoria)),
          borderRadius: 6,
          barThickness: 28,
        },
      ],
    }
  }, [data])

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const value = context.parsed.x ?? 0
            const pct = totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0'
            return `$${value.toLocaleString('es-MX')} (${pct}%)`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (value: number | string) => `$${Number(value).toLocaleString('es-MX')}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 12, weight: 500 } },
      },
    },
  }

  if (data.length === 0) {
    return (
      <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {type === 'gasto' ? '💸' : '💰'} {title}
        </h3>
        <p className="text-center py-8 text-gray-400">
          No hay {type === 'gasto' ? 'gastos' : 'ingresos'} en este período
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {type === 'gasto' ? '💸' : '💰'} {title}
        </h3>
        <span className="text-sm text-gray-500">
          Total:{' '}
          <span className="font-bold text-gray-800">
            ${totalAmount.toLocaleString('es-MX')}
          </span>
        </span>
      </div>
      <div style={{ height: `${Math.max(180, data.length * 44)}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
