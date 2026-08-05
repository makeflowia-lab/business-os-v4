'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import {
  X,
  Activity,
  CheckSquare,
  Brain,
  Sparkles,
  BookOpen,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react'
import type { Agent, AgentStatus, Task, Activity as ActivityType } from '@/types/database'

const STATUS_COLORS: Record<AgentStatus, { dot: string; label: string; bg: string }> = {
  active: { dot: 'bg-emerald-400', label: 'Active', bg: 'bg-emerald-400/10' },
  idle: { dot: 'bg-white/30', label: 'Idle', bg: 'bg-white/[0.06]' },
  blocked: { dot: 'bg-red-400', label: 'Blocked', bg: 'bg-red-400/10' },
}

interface AgentDetailTrayProps {
  agent: Agent
  onClose: () => void
}

export function AgentDetailTray({ agent, onClose }: AgentDetailTrayProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [showPersonality, setShowPersonality] = useState(false)

  const fetchAgentData = useCallback(async () => {
    const supabase = createClient()

    const [tasksRes, activitiesRes] = await Promise.all([
      supabase
        .from('task_assignees')
        .select('tasks(*)')
        .eq('agent_id', agent.id)
        .limit(20),
      supabase
        .from('activities')
        .select('*')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (tasksRes.data) {
      const agentTasks = tasksRes.data
        .map((ta) => (ta as unknown as { tasks: Task }).tasks)
        .filter((t): t is Task => t !== null)
      setTasks(agentTasks)
    }

    if (activitiesRes.data) {
      setActivities(activitiesRes.data as ActivityType[])
    }
  }, [agent.id])

  useEffect(() => {
    fetchAgentData()
  }, [fetchAgentData])

  const statusConfig = STATUS_COLORS[agent.status]
  const activeTasks = tasks.filter((t) => t.status === 'in_progress')
  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const completedTasks = tasks.filter((t) => t.status === 'done')
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
  const hasPersonality = !!(agent.system_prompt || agent.character || agent.lore)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      <aside className="fixed right-0 top-14 bottom-0 z-50 md:relative md:top-0 md:z-0 w-full max-w-[22rem] md:w-80 md:max-w-none bg-white/[0.03] backdrop-blur-xl border-l border-white/[0.06] flex flex-col overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white/80">Agent Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {/* Agent info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-4xl">{agent.avatar}</span>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${statusConfig.dot}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-white/50">{agent.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bg} ${
                    agent.status === 'active' ? 'text-emerald-400' :
                    agent.status === 'blocked' ? 'text-red-400' :
                    'text-white/40'
                  }`}>
                    {statusConfig.label}
                  </span>
                  <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                    agent.level === 'LEAD' ? 'text-purple-300 bg-purple-400/10 border-purple-400/20' :
                    agent.level === 'INT' ? 'text-blue-300 bg-blue-400/10 border-blue-400/20' :
                    'text-white/50 bg-white/[0.06] border-white/[0.1]'
                  }`}>{agent.level}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06] text-center">
                <p className="text-xl font-bold text-white">{activeTasks.length}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Active</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06] text-center">
                <p className="text-xl font-bold text-yellow-400">{todoTasks.length}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">To-do</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06] text-center">
                <p className="text-xl font-bold text-emerald-400">{completedTasks.length}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Done</p>
              </div>
            </div>

            {/* Completion Rate */}
            {totalTasks > 0 && (
              <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={12} className="text-white/30" />
                    <span className="text-[10px] uppercase tracking-widest text-white/30">Completion Rate</span>
                  </div>
                  <span className="text-xs font-bold text-white/60">{completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500/60 to-emerald-500/60 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/20 mt-1">{completedTasks.length} of {totalTasks} tasks completed</p>
              </div>
            )}

            {/* Personality Section */}
            {hasPersonality && (
              <div>
                <button
                  onClick={() => setShowPersonality(!showPersonality)}
                  className="w-full flex items-center gap-2 mb-2"
                >
                  <Brain size={14} className="text-purple-400/60" />
                  <label className="text-[11px] uppercase tracking-widest text-white/40 cursor-pointer">Personality</label>
                  <span className="text-[10px] text-white/20 ml-auto">{showPersonality ? 'Hide' : 'Show'}</span>
                </button>
                {showPersonality && (
                  <div className="space-y-2.5">
                    {agent.system_prompt && (
                      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles size={10} className="text-blue-400/60" />
                          <span className="text-[9px] uppercase tracking-widest text-white/25">System Prompt</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{agent.system_prompt}</p>
                      </div>
                    )}
                    {agent.character && (
                      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap size={10} className="text-yellow-400/60" />
                          <span className="text-[9px] uppercase tracking-widest text-white/25">Character</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{agent.character}</p>
                      </div>
                    )}
                    {agent.lore && (
                      <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpen size={10} className="text-emerald-400/60" />
                          <span className="text-[9px] uppercase tracking-widest text-white/25">Lore</span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{agent.lore}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Active Tasks */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare size={14} className="text-white/40" />
                <label className="text-[11px] uppercase tracking-widest text-white/40">Current Tasks</label>
              </div>
              {activeTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {activeTasks.map((t) => (
                    <div key={t.id} className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                      <p className="text-xs text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="text-[10px] text-white/30">In Progress</span>
                        {t.started_at && (
                          <span className="text-[10px] text-white/20 ml-auto flex items-center gap-0.5">
                            <Clock size={8} />
                            {formatDistanceToNow(new Date(t.started_at), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 italic px-1">No active tasks</p>
              )}

              {/* To-do tasks */}
              {todoTasks.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <span className="text-[11px] uppercase tracking-widest text-white/30">To-do</span>
                  </div>
                  <div className="space-y-1.5">
                    {todoTasks.map((t) => (
                      <div key={t.id} className="bg-purple-500/[0.04] rounded-lg px-3 py-2 border border-purple-500/[0.1]">
                        <p className="text-xs text-white truncate">{t.title}</p>
                        <span className="text-[10px] text-blue-300/50">To-do</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-white/40" />
                <label className="text-[11px] uppercase tracking-widest text-white/40">Recent Activity</label>
              </div>
              {activities.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activities.slice(0, 15).map((a) => (
                    <div key={a.id} className="flex gap-2 text-xs">
                      <span className="text-white/20 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/[0.15] mt-1.5" />
                      <div className="min-w-0">
                        <p className="text-white/50 truncate">{a.message}</p>
                        {a.created_at && (
                          <p className="text-[10px] text-white/20">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/20 italic px-1">No recent activity</p>
              )}
            </div>

            {/* Session info */}
            {agent.session_key && (
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between text-[10px] text-white/25">
                  <span>Session Key</span>
                  <span className="font-mono">{agent.session_key}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
