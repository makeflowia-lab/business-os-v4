import Link from 'next/link'
import { NeuCard } from '@/shared/components/ui/NeuCard'
import { NeuButton } from '@/shared/components/ui/NeuButton'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center p-4">
      <NeuCard size="lg" className="w-full max-w-md text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Revisa tu Email</h1>
          <p className="text-gray-500">
            Te enviamos un link de confirmacion. Revisa tu bandeja de entrada para completar tu registro.
          </p>
          <Link href="/login">
            <NeuButton variant="secondary" className="mt-4">
              Volver al login
            </NeuButton>
          </Link>
        </div>
      </NeuCard>
    </div>
  )
}
