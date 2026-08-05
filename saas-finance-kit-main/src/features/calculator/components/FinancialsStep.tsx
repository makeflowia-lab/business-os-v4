'use client'

import { NeuInput } from '@/shared/components/ui'
import { useCalculatorStore } from '../store/calculatorStore'

export function FinancialsStep() {
  const { inputs, updateInputs } = useCalculatorStore()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">Datos Financieros</h2>
        <p className="text-gray-500 mt-2">Ingresa tus números mensuales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeuInput
          label="Ingresos Mensuales"
          name="monthlyRevenue"
          type="number"
          placeholder="150,000"
          value={inputs.monthlyRevenue || ''}
          onChange={(e) => updateInputs({ monthlyRevenue: Number(e.target.value) })}
          helper="Total de ventas del mes"
        />

        <NeuInput
          label="Efectivo Disponible"
          name="currentCash"
          type="number"
          placeholder="500,000"
          value={inputs.currentCash || ''}
          onChange={(e) => updateInputs({ currentCash: Number(e.target.value) })}
          helper="Dinero en banco ahora mismo"
        />

        <NeuInput
          label="Gastos Fijos Mensuales"
          name="fixedCosts"
          type="number"
          placeholder="80,000"
          value={inputs.fixedCosts || ''}
          onChange={(e) => updateInputs({ fixedCosts: Number(e.target.value) })}
          helper="Renta, servicios, seguros, etc."
        />

        <NeuInput
          label="Gastos Variables Mensuales"
          name="variableCosts"
          type="number"
          placeholder="40,000"
          value={inputs.variableCosts || ''}
          onChange={(e) => updateInputs({ variableCosts: Number(e.target.value) })}
          helper="Materia prima, comisiones, etc."
        />
      </div>
    </div>
  )
}
