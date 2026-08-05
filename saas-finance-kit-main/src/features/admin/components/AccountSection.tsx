'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Mail, Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserInfo {
  email: string
  created_at: string
}

export function AccountSection() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          created_at: user.created_at,
        })
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">Informacion de Cuenta</h3>
        <p className="text-sm text-gray-500">
          Detalles de tu cuenta y opciones de sesion
        </p>
      </div>

      {/* User Info Card */}
      <div className="p-6 bg-neu-bg shadow-neu rounded-2xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">
              {user?.email?.split('@')[0] || 'Usuario'}
            </h4>
            <p className="text-sm text-gray-500">Cuenta activa</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-gray-700">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Miembro desde</p>
              <p className="text-sm text-gray-700">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Cerrando sesion...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Cerrar Sesion
            </>
          )}
        </button>
      </div>
    </div>
  )
}
