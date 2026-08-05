'use client'

import { WIZARD_STEPS } from '../types'

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center">
        {WIZARD_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${
                    step.id < currentStep
                      ? 'bg-emerald-500 text-white shadow-neu-sm'
                      : step.id === currentStep
                        ? 'bg-neu-bg shadow-neu text-blue-600'
                        : 'bg-neu-bg shadow-neu-inset text-gray-400'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${step.id === currentStep ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`
                  h-0.5 w-12 sm:w-20 mx-2
                  ${step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
