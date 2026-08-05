'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Agent } from '@/types/database'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('agents').select('*').order('level')
    if (data) setAgents(data as Agent[])
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    supabase.from('agents').select('*').order('level').then(({ data }) => {
      if (data) setAgents(data as Agent[])
      setLoading(false)
    })

    // Realtime subscription
    const channel = supabase
      .channel('agents-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgents(prev => [...prev, payload.new as Agent])
          } else if (payload.eventType === 'UPDATE') {
            setAgents(prev => prev.map(a => a.id === (payload.new as Agent).id ? payload.new as Agent : a))
          } else if (payload.eventType === 'DELETE') {
            setAgents(prev => prev.filter(a => a.id !== (payload.old as Agent).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeCount = agents.filter(a => a.status === 'active').length

  return { agents, loading, activeCount, refetch }
}
