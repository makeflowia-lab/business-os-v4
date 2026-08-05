'use client'

import { useState } from 'react'
import { updatePassword } from '@/actions/auth'

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
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/50 tracking-wide pl-1">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full bg-white/[0.04] backdrop-blur-lg border border-white/[0.08] rounded-2xl px-5 py-3.5 text-white text-sm placeholder:text-white/25 outline-none transition-all duration-300 focus:bg-white/[0.08] focus:border-white/[0.15] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
          />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/[0.08] border border-red-500/[0.15] rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="relative w-full overflow-hidden rounded-2xl px-8 py-3.5 bg-white text-gray-900 font-semibold text-sm tracking-wide shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-white/95 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <span className="relative z-10">
          {loading ? 'Updating...' : 'Update Password'}
        </span>
      </button>
    </form>
  )
}
