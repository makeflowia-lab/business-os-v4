'use client'

import { Plus, Minus } from 'lucide-react'
import { TipoTransaccion } from '../types'

interface QuickActionButtonsProps {
  onQuickAction: (tipo: TipoTransaccion) => void
}

export function QuickActionButtons({ onQuickAction }: QuickActionButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      {/* Ingreso: + verde */}
      <button
        onClick={() => onQuickAction('ingreso')}
        className="
          w-14 h-14 rounded-full
          bg-neu-bg shadow-neu
          text-emerald-500
          flex items-center justify-center
          transition-all duration-200
          hover:shadow-neu-sm hover:text-emerald-600
          active:shadow-neu-inset
        "
        title="Nuevo Ingreso"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Gasto: - rojo */}
      <button
        onClick={() => onQuickAction('gasto')}
        className="
          w-14 h-14 rounded-full
          bg-neu-bg shadow-neu
          text-red-500
          flex items-center justify-center
          transition-all duration-200
          hover:shadow-neu-sm hover:text-red-600
          active:shadow-neu-inset
        "
        title="Nuevo Gasto"
      >
        <Minus className="w-7 h-7" strokeWidth={2.5} />
      </button>
    </div>
  )
}
