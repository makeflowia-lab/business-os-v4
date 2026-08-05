'use client'

import { NeuInput } from '@/shared/components/ui'
import { useCalculatorStore } from '../store/calculatorStore'

export function GrowthStep() {
  const { inputs, updateInputs } = useCalculatorStore()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">Motor de Crecimiento</h2>
        <p className="text-gray-500 mt-2">Marketing y clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeuInput
          label="Presupuesto de Marketing"
          name="marketingBudget"
          type="number"
          placeholder="20,000"
          value={inputs.marketingBudget || ''}
          onChange={(e) => updateInputs({ marketingBudget: Number(e.target.value) })}
          helper="Inversión mensual en publicidad"
        />

        <NeuInput
          label="Nuevos Clientes por Mes"
          name="newCustomersMonthly"
          type="number"
          placeholder="50"
          value={inputs.newCustomersMonthly || ''}
          onChange={(e) => updateInputs({ newCustomersMonthly: Number(e.target.value) })}
          helper="Clientes que adquieres mensualmente"
        />

        <NeuInput
          label="Tasa de Abandono (Churn %)"
          name="churnRate"
          type="number"
          placeholder="5"
          min="0"
          max="100"
          value={inputs.churnRate || ''}
          onChange={(e) => updateInputs({ churnRate: Number(e.target.value) })}
          helper="% de clientes que pierdes por mes"
        />

        <NeuInput
          label="Ticket Promedio"
          name="averageTicket"
          type="number"
          placeholder="3,000"
          value={inputs.averageTicket || ''}
          onChange={(e) => updateInputs({ averageTicket: Number(e.target.value) })}
          helper="Venta promedio por cliente"
        />

        <NeuInput
          label="Vida del Cliente (meses)"
          name="customerLifetimeMonths"
          type="number"
          placeholder="12"
          value={inputs.customerLifetimeMonths || ''}
          onChange={(e) => updateInputs({ customerLifetimeMonths: Number(e.target.value) })}
          helper="Meses promedio que un cliente permanece"
        />
      </div>
    </div>
  )
}
