'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, TrendingUp, Clock, Zap } from 'lucide-react'
import { format, subDays, startOfDay, isAfter } from 'date-fns'
import type { Agent, Task, Activity } from '@/types/database'

interface AgentStats {
  agent: Agent
  totalTasks: number
  completedTasks: number
  activeTasks: number
  avgCompletionTime: number | null // hours
  activityCount: number
}

export function AnalyticsDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [agentsRes, tasksRes, activitiesRes] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase.from('tasks').select('*, task_assignees(agent_id)'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(500),
      ])

      if (agentsRes.data) setAgents(agentsRes.data as Agent[])
      if (tasksRes.data) setTasks(tasksRes.data as unknown as Task[])
      if (activitiesRes.data) setActivities(activitiesRes.data as Activity[])
      setLoading(false)
    }
    fetchData()
  }, [])

  const periodStart = useMemo(() => {
    if (period === '7d') return startOfDay(subDays(new Date(), 7))
    if (period === '30d') return startOfDay(subDays(new Date(), 30))
    return new Date(0)
  }, [period])

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!a.created_at) return false
      return isAfter(new Date(a.created_at), periodStart)
    })
  }, [activities, periodStart])

  const agentStats: AgentStats[] = useMemo(() => {
    return agents.map((agent) => {
      const agentTasks = tasks.filter((t) => {
        const assignees = (t as unknown as { task_assignees: { agent_id: string }[] }).task_assignees || []
        return assignees.some((a) => a.agent_id === agent.id)
      })
      const completed = agentTasks.filter((t) => t.status === 'done' || t.status === 'archived')
      const active = agentTasks.filter((t) => t.status === 'in_progress' || t.status === 'todo')
      const agentActivities = filteredActivities.filter((a) => a.agent_id === agent.id)

      return {
        agent,
        totalTasks: agentTasks.length,
        completedTasks: completed.length,
        activeTasks: active.length,
        avgCompletionTime: null,
        activityCount: agentActivities.length,
      }
    }).sort((a, b) => b.completedTasks - a.completedTasks)
  }, [agents, tasks, filteredActivities])

  // Activity heatmap - last 7 days
  const dailyActivity = useMemo(() => {
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i)
      const dayStr = format(day, 'yyyy-MM-dd')
      const count = activities.filter((a) => {
        if (!a.created_at) return false
        return format(new Date(a.created_at), 'yyyy-MM-dd') === dayStr
      }).length
      days.push({ date: format(day, 'EEE'), count })
    }
    return days
  }, [activities])

  const maxDailyCount = Math.max(...dailyActivity.map((d) => d.count), 1)

  // Summary stats
  const totalCompleted = agentStats.reduce((sum, a) => sum + a.completedTasks, 0)
  const totalActive = agentStats.reduce((sum, a) => sum + a.activeTasks, 0)
  const totalActivities = filteredActivities.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-white/50" />
          <h2 className="text-sm font-semibold text-white/80">Analytics</h2>
        </div>
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-all
                ${period === p ? 'bg-white/[0.1] text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'}
              `}
            >
              {p === 'all' ? 'All time' : p === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400/60" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Completed</span>
          </div>
          <span className="text-2xl font-bold text-white">{totalCompleted}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-400/60" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Active</span>
          </div>
          <span className="text-2xl font-bold text-white">{totalActive}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-blue-400/60" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Activities</span>
          </div>
          <span className="text-2xl font-bold text-white">{totalActivities}</span>
        </div>
      </div>

      {/* Activity chart (simple bar chart) */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="text-xs font-medium text-white/60 mb-4">Activity (last 7 days)</h3>
        <div className="flex items-end gap-2 h-20">
          {dailyActivity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-blue-500/30 rounded-t-sm transition-all hover:bg-blue-500/50"
                style={{ height: `${(day.count / maxDailyCount) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
              />
              <span className="text-[9px] text-white/30">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent leaderboard */}
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-medium text-white/60">Agent Performance</h3>
        </div>
        <div>
          {agentStats.map((stat, i) => (
            <div
              key={stat.agent.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-[10px] text-white/20 font-mono w-4">{i + 1}</span>
              <span className="text-lg">{stat.agent.avatar}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/70 font-medium">{stat.agent.name}</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-emerald-400/60">{stat.completedTasks} done</span>
                  <span className="text-[10px] text-yellow-400/60">{stat.activeTasks} active</span>
                  <span className="text-[10px] text-blue-400/60">{stat.activityCount} actions</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500/60 rounded-full"
                  style={{
                    width: stat.totalTasks > 0
                      ? `${(stat.completedTasks / stat.totalTasks) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          ))}
          {agentStats.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-white/20">No agent data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
