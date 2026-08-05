'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ActivityFeed, AnalyticsDashboard, SessionsMonitor, ConversationsMonitor } from '@/features/activity/components'
import { useActivities } from '@/features/activity/hooks/useActivities'
import { Activity, BarChart2, MessageSquare, Bot } from 'lucide-react'

type TabView = 'feed' | 'analytics' | 'sessions' | 'conversations'

function ActivityContent() {
  const searchParams = useSearchParams()
  const initialView = searchParams.get('view') === 'analytics' ? 'analytics' : 'feed'
  const activityData = useActivities()
  const [tab, setTab] = useState<TabView>(initialView)

  return (
    <div className="h-full flex flex-col">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-4 md:px-6 pt-4 pb-2">
        <button
          onClick={() => setTab('feed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'feed' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <Activity size={14} />
          Feed
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'analytics' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <BarChart2 size={14} />
          Analytics
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
          onClick={() => setTab('conversations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${tab === 'conversations' ? 'bg-white/[0.08] text-white/70' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}
          `}
        >
          <Bot size={14} />
          Agent
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
        {tab === 'feed' ? (
          <ActivityFeed {...activityData} />
        ) : tab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : tab === 'sessions' ? (
          <SessionsMonitor />
        ) : (
          <ConversationsMonitor />
        )}
      </div>
    </div>
  )
}

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityContent />
    </Suspense>
  )
}
