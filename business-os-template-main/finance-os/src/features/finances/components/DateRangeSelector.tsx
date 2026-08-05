'use client'

import { Calendar, Clock, CalendarRange } from 'lucide-react'
import { VistaRango } from '../types'

interface DateRangeSelectorProps {
  vista: VistaRango
  customRange: { start: Date | null; end: Date | null }
  onVistaChange: (vista: VistaRango) => void
  onCustomRangeChange: (start: Date, end: Date) => void
}

function getContextLabel(
  vista: VistaRango,
  customRange: { start: Date | null; end: Date | null }
): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

  switch (vista) {
    case 'historico':
      return 'Todo el tiempo'
    case 'mensual':
      return 'Últimos 30 días'
    case 'personalizada':
      if (customRange.start && customRange.end) {
        return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`
      }
      return 'Selecciona fechas'
    default:
      return ''
  }
}

const vistaOptions: { value: VistaRango; label: string; icon: typeof Clock }[] = [
  { value: 'historico', label: 'Historico', icon: Clock },
  { value: 'mensual', label: 'Mensual', icon: Calendar },
  { value: 'personalizada', label: 'Personalizado', icon: CalendarRange },
]

export function DateRangeSelector({
  vista,
  customRange,
  onVistaChange,
  onCustomRangeChange,
}: DateRangeSelectorProps) {
  const contextLabel = getContextLabel(vista, customRange)

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value)
    const end = customRange.end || new Date()
    onCustomRangeChange(newStart, end)
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = customRange.start || new Date()
    const newEnd = new Date(e.target.value)
    onCustomRangeChange(start, newEnd)
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-4 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Vista Toggle Buttons */}
        <div className="flex gap-2">
          {vistaOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onVistaChange(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  vista === value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-neu-bg shadow-neu-inset text-gray-600 hover:text-gray-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Context Label */}
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm font-medium capitalize">{contextLabel}</span>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {vista === 'personalizada' && (
        <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={formatDateForInput(customRange.start)}
              onChange={handleStartChange}
              className="w-full px-3 py-2 rounded-lg bg-neu-bg shadow-neu-inset text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={formatDateForInput(customRange.end)}
              onChange={handleEndChange}
              className="w-full px-3 py-2 rounded-lg bg-neu-bg shadow-neu-inset text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
