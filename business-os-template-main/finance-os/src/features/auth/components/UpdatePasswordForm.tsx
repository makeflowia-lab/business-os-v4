'use client'

import { useState } from 'react'
import { updatePassword } from '@/actions/auth'
import { NeuInput } from '@/shared/components/ui/NeuInput'
import { NeuButton } from '@/shared/components/ui/NeuButton'
import { NeuCard } from '@/shared/components/ui/NeuCard'

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updatePassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <NeuCard size="lg" className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Password</h1>
          <p className="text-gray-500 mt-2">Ingresa tu nuevo password</p>
        </div>

        <NeuInput
          name="password"
          type="password"
          label="Nuevo Password"
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
          Actualizar Password
        </NeuButton>
      </form>
    </NeuCard>
  )
}
