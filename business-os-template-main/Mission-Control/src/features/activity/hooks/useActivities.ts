'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityType, Agent } from '@/types/database'

export type ActivityFilter = 'all' | ActivityType

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<ActivityFilter>('all')
  const [agentFilter, setAgentFilter] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Fetch activities with agent info
    async function fetchActivities() {
      const { data } = await supabase
        .from('activities')
        .select('*, agents(*)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) {
        const mapped = data.map(a => ({
          ...a,
          agent: a.agents as unknown as Agent,
        })) as Activity[]
        setActivities(mapped)
      }
      setLoading(false)
    }

    // Fetch agents for filter
    async function fetchAgents() {
      const { data } = await supabase.from('agents').select('*')
      if (data) setAgents(data as Agent[])
    }

    fetchActivities()
    fetchAgents()

    // Realtime subscription for new activities
    const channel = supabase
      .channel('activities-feed')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        async (payload) => {
          // Fetch the complete activity with agent info
          const { data } = await supabase
            .from('activities')
            .select('*, agents(*)')
            .eq('id', (payload.new as { id: string }).id)
            .single()

          if (data) {
            const activity = {
              ...data,
              agent: data.agents as unknown as Agent,
            } as Activity
            setActivities(prev => [activity, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Apply filters
  const filtered = activities.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    if (agentFilter && a.agent_id !== agentFilter) return false
    return true
  })

  return {
    activities: filtered,
    allActivities: activities,
    agents,
    loading,
    typeFilter,
    setTypeFilter,
    agentFilter,
    setAgentFilter,
  }
}
