'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/actions/auth'
import { NeuInput } from '@/shared/components/ui/NeuInput'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { NeuCard } from '@/shared/components/ui/NeuCard'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <NeuCard size="lg" className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Crear Cuenta</h1>
          <p className="text-gray-500 mt-2">Comienza gratis</p>
        </div>

        <NeuInput
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />

        <NeuInput
          name="password"
          type="password"
          label="Password"
          placeholder="Minimo 6 caracteres"
          required
          minLength={6}
          autoComplete="new-password"
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
          Crear Cuenta
        </NeuButton>

        <p className="text-center text-sm text-gray-500">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </form>
    </NeuCard>
  )
}
