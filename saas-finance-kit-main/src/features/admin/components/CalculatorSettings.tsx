'use client'

import { useState, useEffect } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { CalculatorDefaults } from '../types'

interface CalculatorSettingsProps {
  defaults: CalculatorDefaults
  onSave: (defaults: CalculatorDefaults) => Promise<void>
}

const DEFAULT_VALUES: CalculatorDefaults = {
  monthlyRevenue: 50000,
  fixedCosts: 15000,
  variableCostPercent: 30,
  taxRate: 16,
  desiredProfit: 20000,
}

export function CalculatorSettings({ defaults, onSave }: CalculatorSettingsProps) {
  const [values, setValues] = useState<CalculatorDefaults>({
    ...DEFAULT_VALUES,
    ...defaults,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const current = { ...DEFAULT_VALUES, ...defaults }
    const changed = Object.keys(values).some(
      key => values[key as keyof CalculatorDefaults] !== current[key as keyof CalculatorDefaults]
    )
    setHasChanges(changed)
  }, [values, defaults])

  const handleChange = (key: keyof CalculatorDefaults, value: string) => {
    const numValue = parseFloat(value) || 0
    setValues(prev => ({ ...prev, [key]: numValue }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(values)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setValues(DEFAULT_VALUES)
  }

  const fields: { key: keyof CalculatorDefaults; label: string; prefix?: string; suffix?: string }[] = [
    { key: 'monthlyRevenue', label: 'Ingresos Mensuales', prefix: '$' },
    { key: 'fixedCosts', label: 'Costos Fijos', prefix: '$' },
    { key: 'variableCostPercent', label: 'Costos Variables', suffix: '%' },
    { key: 'taxRate', label: 'Tasa de Impuestos', suffix: '%' },
    { key: 'desiredProfit', label: 'Utilidad Deseada', prefix: '$' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Variables de Calculadora ROI</h3>
          <p className="text-sm text-gray-500">
            Valores predeterminados para el wizard de calculadora
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neu-bg shadow-neu rounded-lg text-xs text-gray-500 hover:shadow-neu-sm transition-shadow"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label, prefix, suffix }) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
              {label}
            </label>
            <div className="relative">
              {prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {prefix}
                </span>
              )}
              <input
                type="number"
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className={`w-full py-2 bg-neu-bg shadow-neu-inset rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  prefix ? 'pl-8 pr-4' : suffix ? 'pl-4 pr-8' : 'px-4'
                }`}
              />
              {suffix && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview de calculos */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-2">
        <h4 className="text-sm font-medium text-gray-600">Preview de Calculos</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Costos Variables:</div>
          <div className="text-gray-700 font-medium">
            ${((values.monthlyRevenue || 0) * (values.variableCostPercent || 0) / 100).toLocaleString()}
          </div>
          <div className="text-gray-500">Costos Totales:</div>
          <div className="text-gray-700 font-medium">
            ${(
              (values.fixedCosts || 0) +
              (values.monthlyRevenue || 0) * (values.variableCostPercent || 0) / 100
            ).toLocaleString()}
          </div>
          <div className="text-gray-500">Utilidad Bruta:</div>
          <div className="text-gray-700 font-medium">
            ${(
              (values.monthlyRevenue || 0) -
              (values.fixedCosts || 0) -
              (values.monthlyRevenue || 0) * (values.variableCostPercent || 0) / 100
            ).toLocaleString()}
          </div>
          <div className="text-gray-500">Impuestos:</div>
          <div className="text-gray-700 font-medium">
            ${(
              ((values.monthlyRevenue || 0) -
                (values.fixedCosts || 0) -
                (values.monthlyRevenue || 0) * (values.variableCostPercent || 0) / 100) *
              (values.taxRate || 0) / 100
            ).toLocaleString()}
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
