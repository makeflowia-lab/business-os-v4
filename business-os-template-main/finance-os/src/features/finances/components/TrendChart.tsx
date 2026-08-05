'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Transaction } from '../types'
import { generateTrendData, generateCategoryTrendData } from '../services/analytics'
import { getCategoryColor } from '@/lib/categoryColors'

const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
)

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type FiltroTipo = 'ambos' | 'ingresos' | 'gastos'

interface TrendChartProps {
  transactions: Transaction[]
}

export function TrendChart({ transactions }: TrendChartProps) {
  const [filtro, setFiltro] = useState<FiltroTipo>('ambos')

  const chartData = useMemo(() => {
    // "Ambos" muestra solo 2 líneas: Ingresos totales vs Gastos totales
    if (filtro === 'ambos') {
      const trendData = generateTrendData(transactions, 30)
      const labels = trendData.map((d) => {
        const date = new Date(d.fecha)
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      })

      return {
        labels,
        datasets: [
          {
            label: 'Ingresos',
            data: trendData.map((d) => d.ingresos),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Gastos',
            data: trendData.map((d) => d.gastos),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
        ],
      }
    }

    // "Ingresos" o "Gastos" muestra líneas por categoría
    const tipo = filtro === 'ingresos' ? 'ingreso' : 'gasto'
    const { labels, categories, data } = generateCategoryTrendData(
      transactions,
      tipo,
      30
    )

    const formattedLabels = labels.map((dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    })

    const datasets = categories.map((cat) => {
      const color = getCategoryColor(cat)
      return {
        label: cat,
        data: data[cat],
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    })

    return { labels: formattedLabels, datasets }
  }, [transactions, filtro])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y ?? 0
            if (value === 0) return ''
            return `${context.dataset.label}: $${value.toLocaleString('es-MX')}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (value: number | string) => `$${Number(value).toLocaleString('es-MX')}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  const filterButtons: { id: FiltroTipo; label: string; activeColor: string }[] = [
    { id: 'ambos', label: 'Ambos', activeColor: 'text-blue-600' },
    { id: 'ingresos', label: 'Ingresos', activeColor: 'text-emerald-600' },
    { id: 'gastos', label: 'Gastos', activeColor: 'text-red-600' },
  ]

  if (transactions.length === 0) {
    return (
      <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tendencias</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          No hay datos para mostrar
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Tendencias</h3>
        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFiltro(btn.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filtro === btn.id
                  ? `bg-neu-bg shadow-neu-inset ${btn.activeColor}`
                  : 'bg-neu-bg shadow-neu text-gray-600 hover:shadow-neu-sm'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
