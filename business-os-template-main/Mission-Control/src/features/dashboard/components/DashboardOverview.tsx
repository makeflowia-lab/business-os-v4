'use client'
import { useMemo } from 'react'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { useAgents } from '@/features/agents/hooks/useAgents'
import { CheckSquare, AlertCircle, Clock, TrendingUp, Users, Zap } from 'lucide-react'
import type { TaskStatus } from '@/types/database'

const STATUS_GROUPS: Record<string, TaskStatus[]> = {
  active: ['todo', 'in_progress'],
  done: ['done'],
  inbox: ['backlog'],
}

export function DashboardOverview() {
  const tasks = useTasksStore((s) => s.tasks)
  const { agents } = useAgents()

  const stats = useMemo(() => {
    const total = tasks.length
    const active = tasks.filter((t) => STATUS_GROUPS.active.includes(t.status)).length
    const done = tasks.filter((t) => STATUS_GROUPS.done.includes(t.status)).length
    const inbox = tasks.filter((t) => STATUS_GROUPS.inbox.includes(t.status)).length
    const overdue = tasks.filter((t) => {
      if (!t.due_at || t.status === 'done' || t.status === 'archived') return false
      return new Date(t.due_at) < new Date()
    }).length
    const urgent = tasks.filter((t) => (t.priority ?? 0) === 1 && t.status !== 'done' && t.status !== 'archived').length
    const activeAgents = agents.filter((a) => a.status === 'active').length
    const totalAgents = agents.length

    return { total, active, done, inbox, overdue, urgent, activeAgents, totalAgents }
  }, [tasks, agents])

  const cards = [
    { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Done', value: stats.done, icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Agents', value: `${stats.activeAgents}/${stats.totalAgents}`, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', sublabel: 'active' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl p-4 border border-white/[0.06] relative overflow-hidden`}
          >
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <Icon size={16} className={card.color} />
              {card.label === 'Overdue' && stats.urgent > 0 && (
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                  {stats.urgent} urgent
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
              {'sublabel' in card ? card.sublabel : card.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
