'use client'

import { useRouter } from 'next/navigation'
import { NeuCard, NeuButton } from '@/shared/components/ui'
import { useCalculatorStore } from '../store/calculatorStore'
import { StepIndicator } from './StepIndicator'
import { FinancialsStep } from './FinancialsStep'
import { GrowthStep } from './GrowthStep'
import { OperationsStep } from './OperationsStep'
import { IndustryStep } from './IndustryStep'

export function Wizard() {
  const router = useRouter()
  const { currentStep, nextStep, prevStep, calculate, inputs } = useCalculatorStore()

  const handleNext = () => {
    if (currentStep === 4) {
      calculate()
      router.push('/dashboard')
    } else {
      nextStep()
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return inputs.monthlyRevenue > 0
      case 2:
        return true
      case 3:
        return inputs.totalEmployees >= 1
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FinancialsStep />
      case 2:
        return <GrowthStep />
      case 3:
        return <OperationsStep />
      case 4:
        return <IndustryStep />
      default:
        return <FinancialsStep />
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <NeuCard size="lg" className="relative">
        <StepIndicator currentStep={currentStep} />

        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 ? (
            <NeuButton variant="secondary" onClick={prevStep}>
              Anterior
            </NeuButton>
          ) : (
            <div />
          )}

          <NeuButton
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 4 ? 'Ver Diagnóstico' : 'Siguiente'}
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  )
}
