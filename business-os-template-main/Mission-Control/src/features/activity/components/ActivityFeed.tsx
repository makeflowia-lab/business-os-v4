'use client'
import { Activity as ActivityIcon, Loader2 } from 'lucide-react'
import type { Activity, ActivityType, Agent } from '@/types/database'
import type { ActivityFilter } from '../hooks/useActivities'
import { ActivityItem } from './ActivityItem'

const TYPE_FILTER_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'task_update', label: 'Tasks' },
  { value: 'message', label: 'Comments' },
  { value: 'document_created', label: 'Docs' },
  { value: 'status_update', label: 'Status' },
  { value: 'assignees_update', label: 'Assignees' },
]

interface ActivityFeedProps {
  activities: Activity[]
  allActivities: Activity[]
  agents: Agent[]
  loading: boolean
  typeFilter: ActivityFilter
  setTypeFilter: (filter: ActivityFilter) => void
  agentFilter: string | null
  setAgentFilter: (agentId: string | null) => void
}

export function ActivityFeed({
  activities,
  allActivities,
  agents,
  loading,
  typeFilter,
  setTypeFilter,
  agentFilter,
  setAgentFilter,
}: ActivityFeedProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ActivityIcon size={20} className="text-white/60" />
        <h1 className="text-lg font-semibold text-white/90">Activity Feed</h1>
        <span className="text-xs text-white/30 ml-auto">
          {allActivities.length} total
        </span>
      </div>

      {/* Filters Panel */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 mb-4 relative">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mb-3">
          {TYPE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTypeFilter(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${typeFilter === option.value
                  ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                  : 'text-white/40 hover:bg-white/[0.08] hover:text-white/60 border border-transparent'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Agent Filters */}
        {agents.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-wider text-white/30 mr-1">Agent:</span>
            <button
              onClick={() => setAgentFilter(null)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors
                ${agentFilter === null
                  ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                  : 'text-white/40 hover:bg-white/[0.08] hover:text-white/60 border border-transparent'
                }`}
            >
              All
            </button>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setAgentFilter(agentFilter === agent.id ? null : agent.id)}
                title={agent.name}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors
                  ${agentFilter === agent.id
                    ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                    : 'text-white/40 hover:bg-white/[0.08] hover:text-white/60 border border-transparent'
                  }`}
              >
                <span className="text-sm">{agent.avatar}</span>
                <span className="hidden md:inline">{agent.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl relative flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <LoadingSkeleton />
          ) : activities.length === 0 ? (
            <EmptyState hasFilters={typeFilter !== 'all' || agentFilter !== null} />
          ) : (
            <div className="space-y-0.5">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={20} className="text-white/20 animate-spin" />
      <p className="text-xs text-white/30">Loading activities...</p>
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <ActivityIcon size={24} className="text-white/15" />
      <p className="text-sm text-white/40 text-center">
        {hasFilters
          ? 'No activities match the current filters'
          : 'No activity yet. Events will appear here in real-time.'}
      </p>
    </div>
  )
}
