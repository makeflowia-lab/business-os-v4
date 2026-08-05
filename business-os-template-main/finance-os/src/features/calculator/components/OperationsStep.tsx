'use client'

import { NeuInput } from '@/shared/components/ui'
import { useCalculatorStore } from '../store/calculatorStore'

export function OperationsStep() {
  const { inputs, updateInputs } = useCalculatorStore()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">Operaciones</h2>
        <p className="text-gray-500 mt-2">Tu equipo y eficiencia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeuInput
          label="Total de Empleados"
          name="totalEmployees"
          type="number"
          placeholder="10"
          min="1"
          value={inputs.totalEmployees || ''}
          onChange={(e) => updateInputs({ totalEmployees: Number(e.target.value) || 1 })}
          helper="Incluyéndote a ti"
        />

        <NeuInput
          label="Nómina Total Mensual"
          name="totalPayroll"
          type="number"
          placeholder="120,000"
          value={inputs.totalPayroll || ''}
          onChange={(e) => updateInputs({ totalPayroll: Number(e.target.value) })}
          helper="Sueldos + cargas sociales"
        />

        <NeuInput
          label="Merma/Desperdicio (%)"
          name="wastePercentage"
          type="number"
          placeholder="3"
          min="0"
          max="100"
          value={inputs.wastePercentage || ''}
          onChange={(e) => updateInputs({ wastePercentage: Number(e.target.value) })}
          helper="% de producto perdido, robado o dañado"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-amber-500 text-xl">💡</span>
          <div>
            <p className="text-sm text-amber-800 font-medium">Tip: Sé honesto con la merma</p>
            <p className="text-sm text-amber-700 mt-1">
              La mayoría de negocios subestima su desperdicio. Incluye producto caducado,
              robos, errores de inventario, y devoluciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
