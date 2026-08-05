import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FinancialInputs, CalculatedMetrics, DEFAULT_INPUTS } from '../types'
import { calculateMetrics, getOverallHealth } from '../services/calculator'

interface CalculatorState {
  // Wizard state
  currentStep: number
  inputs: FinancialInputs

  // Results
  metrics: CalculatedMetrics | null
  healthScore: number

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateInputs: (partial: Partial<FinancialInputs>) => void
  calculate: () => void
  reset: () => void
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      inputs: DEFAULT_INPUTS,
      metrics: null,
      healthScore: 0,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get()
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      updateInputs: (partial) => {
        set((state) => ({
          inputs: { ...state.inputs, ...partial },
        }))
      },

      calculate: () => {
        const { inputs } = get()
        const metrics = calculateMetrics(inputs)
        const health = getOverallHealth(metrics)
        set({ metrics, healthScore: health.score })
      },

      reset: () => {
        set({
          currentStep: 1,
          inputs: DEFAULT_INPUTS,
          metrics: null,
          healthScore: 0,
        })
      },
    }),
    {
      name: 'profits-os-calculator',
      partialize: (state) => ({
        inputs: state.inputs,
        metrics: state.metrics,
        healthScore: state.healthScore,
      }),
    }
  )
)
