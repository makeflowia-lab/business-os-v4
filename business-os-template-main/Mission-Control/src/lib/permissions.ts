import type { UserRole } from '@/types/database'

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/': ['owner', 'admin', 'member'],
  '/profile': ['owner', 'admin', 'member'],
  '/chat': ['owner'],
  '/activity': ['owner'],
  '/cron': ['owner'],
  '/calendar': ['owner', 'admin'],
  '/draw': ['owner', 'admin'],
  '/settings': ['owner', 'admin', 'member'],
  '/team': ['owner', 'admin', 'member'],
}

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  if (role === 'owner') return true

  // Exact match
  const exact = ROUTE_PERMISSIONS[pathname]
  if (exact) return exact.includes(role)

  // Prefix match for dynamic routes like /draw/[id]
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route !== '/' && pathname.startsWith(route + '/')) {
      return roles.includes(role)
    }
  }

  // Default: owner-only
  return false
}
