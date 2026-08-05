'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/actions/auth'
import { NeuInput } from '@/shared/components/ui/NeuInput'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { NeuCard } from '@/shared/components/ui/NeuCard'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <NeuCard size="lg" className="w-full max-w-md text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Revisa tu email</h2>
          <p className="text-gray-500">
            Te enviamos un link para restablecer tu password.
          </p>
          <Link href="/login">
            <NeuButton variant="secondary" className="mt-4">
              Volver al login
            </NeuButton>
          </Link>
        </div>
      </NeuCard>
    )
  }

  return (
    <NeuCard size="lg" className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Restablecer Password</h1>
          <p className="text-gray-500 mt-2">Te enviaremos un link a tu email</p>
        </div>

        <NeuInput
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <NeuButton
          type="submit"
          className="w-full"
          size="lg"
          isLoading={loading}
        >
          Enviar Link
        </NeuButton>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            Volver al login
          </Link>
        </p>
      </form>
    </NeuCard>
  )
}
