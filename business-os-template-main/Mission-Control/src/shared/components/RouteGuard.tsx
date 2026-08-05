'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { canAccessRoute } from '@/lib/permissions'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!canAccessRoute(pathname, role)) {
      router.replace('/')
    }
  }, [pathname, role, loading, router])

  if (loading) return null
  if (!canAccessRoute(pathname, role)) return null

  return <>{children}</>
}
