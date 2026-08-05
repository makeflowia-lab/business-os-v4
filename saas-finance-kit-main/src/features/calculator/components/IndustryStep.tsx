'use client'

import { NeuInput, NeuSelect } from '@/shared/components/ui'
import { useCalculatorStore } from '../store/calculatorStore'
import { INDUSTRY_OPTIONS, IndustryType } from '../types'

export function IndustryStep() {
  const { inputs, updateInputs } = useCalculatorStore()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">Contexto del Negocio</h2>
        <p className="text-gray-500 mt-2">Para comparar con tu industria</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
        <NeuInput
          label="Nombre de tu Negocio"
          name="businessName"
          type="text"
          placeholder="Mi Empresa"
          value={inputs.businessName}
          onChange={(e) => updateInputs({ businessName: e.target.value })}
          helper="Opcional, para personalizar tu reporte"
        />

        <NeuSelect
          label="Industria"
          name="industry"
          value={inputs.industry}
          onChange={(e) => updateInputs({ industry: e.target.value as IndustryType })}
          options={INDUSTRY_OPTIONS}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <span className="text-blue-500 text-xl">📊</span>
          <div>
            <p className="text-sm text-blue-800 font-medium">¿Por qué importa la industria?</p>
            <p className="text-sm text-blue-700 mt-1">
              Cada industria tiene benchmarks diferentes. Un margen del 10% es excelente
              en retail pero bajo para servicios. Te compararemos con tu sector.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
