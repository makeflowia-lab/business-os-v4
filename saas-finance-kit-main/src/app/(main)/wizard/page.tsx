'use client'

import { Wizard } from '@/features/calculator'

export default function WizardPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-700 mb-2">
            Profits OS
          </h1>
          <p className="text-xl text-gray-500">
            Tu Sistema Operativo Financiero con IA
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Diagnostica la salud de tu negocio en minutos
          </p>
        </header>

        <Wizard />
      </div>
    </div>
  )
}
