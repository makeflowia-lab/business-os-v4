'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
// next-auth v4
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Contraseña incorrecta.')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Acceso restringido</h1>
          <p className="text-[#475569] text-sm">Solo el maestro puede entrar.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              required
              className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#1a2744] text-[#e2e8f0]
                placeholder-[#475569] outline-none text-sm
                focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/30
                transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7]
              disabled:bg-[#1a2744] disabled:text-[#475569]
              text-white text-sm font-medium transition-all duration-200
              disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}
