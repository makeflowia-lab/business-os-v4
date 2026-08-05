'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const isOwner = profile?.role === 'owner'
  const role: UserRole = profile?.role ?? 'member'

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        if (!mounted) return
        setUser(currentUser)

        if (!currentUser) {
          setProfile(null)
          setLoading(false)
          return
        }

        // Profile fetch runs in a setTimeout(0) to escape the navigator
        // lock held by supabase auth during event emission. Without this,
        // the Supabase client deadlocks trying to acquire the auth lock
        // for the REST API call while it's still held by _initialize().
        setTimeout(async () => {
          if (!mounted) return
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
          if (mounted) {
            setProfile(data)
            setLoading(false)
          }
        }, 0)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading, isOwner, role }
}
