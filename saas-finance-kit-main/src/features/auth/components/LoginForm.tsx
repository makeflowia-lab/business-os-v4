'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { NeuInput } from '@/shared/components/ui/NeuInput'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { NeuCard } from '@/shared/components/ui/NeuCard'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <NeuCard size="lg" className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-gray-500 mt-2">Ingresa a tu cuenta</p>
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
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
          Iniciar Sesion
        </NeuButton>

        <div className="text-center space-y-2">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline block"
          >
            Olvidaste tu password?
          </Link>
          <p className="text-sm text-gray-500">
            No tienes cuenta?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </form>
    </NeuCard>
  )
}
