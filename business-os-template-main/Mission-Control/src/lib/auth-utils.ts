import { createClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

/**
 * Get the user's role from the database.
 * Used in API routes to enforce role-based access control.
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials')
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('Error fetching user role:', error)
    return null
  }

  return (data.role as UserRole) || 'member'
}

/**
 * Check if the user is an owner.
 */
export async function isOwner(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'owner'
}

/**
 * Check if the user has one of the allowed roles.
 */
export async function hasRole(userId: string, ...allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getUserRole(userId)
  return role ? allowedRoles.includes(role) : false
}
