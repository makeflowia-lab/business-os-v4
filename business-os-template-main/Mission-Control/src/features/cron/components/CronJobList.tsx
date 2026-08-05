'use client'
import { useCronJobs, useCronHistory } from '../hooks/useCronJobs'
import { CronJobCard } from './CronJobCard'
import { RefreshCw, WifiOff } from 'lucide-react'

export function CronJobList() {
  const { jobs, loading, error, offline, refetch, runAction } = useCronJobs()
  const { historyByJob, loading: historyLoading, refetch: refetchHistory } = useCronHistory()

  const handleRefresh = () => {
    refetch()
    refetchHistory()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-400/60">Failed to load cron jobs</p>
        <p className="text-xs text-white/30 mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    )
  }

  if (offline) {
    return (
      <div className="text-center py-12">
        <WifiOff size={24} className="mx-auto text-white/20 mb-3" />
        <p className="text-sm text-white/40">Agent server is offline</p>
        <p className="text-xs text-white/25 mt-1">Start the daemon to manage cron jobs</p>
        <button
          onClick={handleRefresh}
          className="mt-3 text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-white/40">No cron jobs configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/30">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} — {jobs.filter((j) => j.status === 'active').length} active
          {!historyLoading && Object.keys(historyByJob).length > 0 && (
            <span className="text-white/20"> — history loaded</span>
          )}
        </p>
        <button
          onClick={handleRefresh}
          className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>
      {jobs.map((job) => (
        <CronJobCard
          key={job.id}
          job={job}
          history={historyByJob[job.id]}
          onAction={runAction}
        />
      ))}
    </div>
  )
}
