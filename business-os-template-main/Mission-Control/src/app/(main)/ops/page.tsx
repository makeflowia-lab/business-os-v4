'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnalyticsDashboard, SessionsMonitor } from '@/features/activity/components'
import { CronJobList } from '@/features/cron/components'
import { AgentLogs } from '@/features/ops/components'
import { BarChart2, MessageSquare, Clock, Terminal } from 'lucide-react'

type TabView = 'dashboard' | 'sessions' | 'cron' | 'logs'

function OpsContent() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view') as TabView | null
  const initialView: TabView = viewParam && ['dashboard', 'sessions', 'cron', 'logs'].includes(viewParam) ? viewParam : 'dashboard'
  const [tab, setTab] = useState<TabView>(initialView)

  return (
    <div className="h-full flex flex-col">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-4 md:px-6 pt-4 pb-2">
        <button
          onClick={() => setTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'dashboard' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <BarChart2 size={14} />
          Dashboard
        </button>
        <button
          onClick={() => setTab('sessions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'sessions' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <MessageSquare size={14} />
          Sessions
        </button>
        <button
          onClick={() => setTab('cron')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'cron' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <Clock size={14} />
          Cron Jobs
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'logs' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <Terminal size={14} />
          Agent Logs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
        {tab === 'dashboard' ? (
          <AnalyticsDashboard />
        ) : tab === 'sessions' ? (
          <SessionsMonitor />
        ) : tab === 'cron' ? (
          <CronJobList />
        ) : (
          <AgentLogs />
        )}
      </div>
    </div>
  )
}

export default function OpsPage() {
  return (
    <Suspense>
      <OpsContent />
    </Suspense>
  )
}
