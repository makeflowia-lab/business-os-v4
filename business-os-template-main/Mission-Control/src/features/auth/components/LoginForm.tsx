'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/actions/auth'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [returnTo, setReturnTo] = useState('/')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access denied. Your account is not authorized.')
    }
    // Priority: URL ?next= param (from middleware) > localStorage (fallback)
    const nextParam = searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      setReturnTo(nextParam)
    } else {
      const last = localStorage.getItem('mc_lastRoute')
      if (last && last !== '/') setReturnTo(last)
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    formData.set('next', returnTo)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white/50 tracking-wide pl-1">
          Email
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/25 outline-none transition-all duration-300 focus:bg-white/[0.08] focus:border-white/[0.15] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
          />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl pointer-events-none" />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/50 tracking-wide pl-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/25 outline-none transition-all duration-300 focus:bg-white/[0.08] focus:border-white/[0.15] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
          />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl pointer-events-none" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/[0.08] border border-red-500/[0.15] rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="relative w-full overflow-hidden rounded-2xl px-8 py-3.5 bg-white text-gray-900 font-semibold text-sm tracking-wide shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/95 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <span className="relative z-10">
          {loading ? 'Signing in...' : 'Sign In'}
        </span>
      </button>

      {/* Forgot password */}
      <p className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
        >
          Forgot password?
        </Link>
      </p>
    </form>
  )
}
