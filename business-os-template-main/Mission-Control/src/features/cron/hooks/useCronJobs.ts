'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CronJob {
  id: string
  chat_id: string
  thread_id: number | null
  prompt: string
  schedule: string
  next_run: number
  last_run: number | null
  last_result: string | null
  status: 'active' | 'paused'
  created_at: number
}

interface CronState {
  jobs: CronJob[]
  loading: boolean
  error: string | null
  offline: boolean
}

export function useCronJobs() {
  const [state, setState] = useState<CronState>({
    jobs: [],
    loading: true,
    error: null,
    offline: false,
  })

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/cron')
      const data = await res.json() as { tasks?: CronJob[]; offline?: boolean }
      setState({
        jobs: data.tasks ?? [],
        loading: false,
        error: null,
        offline: !!data.offline,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: String(err),
      }))
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const runAction = useCallback(
    async (id: string, action: 'run' | 'pause' | 'resume') => {
      await fetch(`/api/cron/${id}/${action}`, { method: 'POST' })
      // Optimistic update for pause/resume
      if (action === 'pause' || action === 'resume') {
        setState((prev) => ({
          ...prev,
          jobs: prev.jobs.map((j) =>
            j.id === id ? { ...j, status: action === 'pause' ? 'paused' : 'active' } : j,
          ),
        }))
      }
      // Refetch after a short delay to get updated state
      setTimeout(fetchJobs, 1000)
    },
    [fetchJobs],
  )

  return { ...state, refetch: fetchJobs, runAction }
}

// ---------------------------------------------------------------------------
// Cron execution history from Supabase (conversations with source='cron')
// ---------------------------------------------------------------------------

export interface CronRun {
  id: string
  run_id: string
  job_id: string // prompt field = job ID
  response: string | null
  error: string | null
  status: 'done' | 'error' | 'pending'
  created_at: string
}

export function useCronHistory() {
  const [runs, setRuns] = useState<CronRun[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from('conversations')
      .select('id, run_id, prompt, response, error, status, created_at')
      .eq('source', 'cron')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setRuns(
        data.map((row) => ({
          id: row.id,
          run_id: row.run_id,
          job_id: row.prompt,
          response: row.response,
          error: row.error,
          status: row.status as CronRun['status'],
          created_at: row.created_at,
        })),
      )
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Group runs by job_id for easy lookup
  const historyByJob = useMemo(() => {
    const map: Record<string, CronRun[]> = {}
    for (const run of runs) {
      if (!map[run.job_id]) map[run.job_id] = []
      map[run.job_id].push(run)
    }
    return map
  }, [runs])

  return { runs, historyByJob, loading, refetch: fetchHistory }
}
