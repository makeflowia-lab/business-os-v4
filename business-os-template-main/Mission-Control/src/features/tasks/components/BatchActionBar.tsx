'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { useAuth } from '@/hooks/useAuth'
import { PRIORITY_CONFIG } from '../utils/priority'
import { X, Trash2, CheckCircle2, Archive, ChevronDown } from 'lucide-react'
import type { TaskStatus, TaskPriority } from '@/types/database'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To-do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
]

export function BatchActionBar() {
  const selectedTaskIds = useTasksStore((s) => s.selectedTaskIds)
  const clearMultiSelect = useTasksStore((s) => s.clearMultiSelect)
  const updateTask = useTasksStore((s) => s.updateTask)
  const removeTask = useTasksStore((s) => s.removeTask)

  const { isOwner } = useAuth()
  const [statusOpen, setStatusOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)

  const count = selectedTaskIds.size
  if (count === 0) return null

  const ids = Array.from(selectedTaskIds)

  const batchUpdateStatus = async (status: TaskStatus) => {
    setStatusOpen(false)
    const supabase = createClient()
    for (const id of ids) {
      updateTask(id, { status })
    }
    await supabase.from('tasks').update({ status }).in('id', ids)
    clearMultiSelect()
  }

  const batchUpdatePriority = async (priority: TaskPriority) => {
    setPriorityOpen(false)
    const supabase = createClient()
    for (const id of ids) {
      updateTask(id, { priority })
    }
    await supabase.from('tasks').update({ priority }).in('id', ids)
    clearMultiSelect()
  }

  const batchDelete = async () => {
    const supabase = createClient()
    for (const id of ids) {
      removeTask(id)
    }
    await supabase.from('tasks').delete().in('id', ids)
    clearMultiSelect()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      bg-[#15151f]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl
      shadow-2xl shadow-black/60 px-4 py-2.5 flex items-center gap-3
      animate-in slide-in-from-bottom-4"
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

      <span className="text-xs font-medium text-white/70">
        {count} selected
      </span>

      <div className="w-[1px] h-5 bg-white/[0.1]" />

      {/* Status dropdown */}
      <div className="relative">
        <button
          onClick={() => { setStatusOpen(!statusOpen); setPriorityOpen(false) }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/[0.08] transition-colors"
        >
          Status <ChevronDown size={10} />
        </button>
        {statusOpen && (
          <div className="absolute bottom-full left-0 mb-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40 min-w-[120px]">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => batchUpdateStatus(s.value)}
                className="w-full text-left px-3 py-1.5 text-xs text-white/60 hover:bg-white/[0.06] transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Priority dropdown */}
      <div className="relative">
        <button
          onClick={() => { setPriorityOpen(!priorityOpen); setStatusOpen(false) }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/[0.08] transition-colors"
        >
          Priority <ChevronDown size={10} />
        </button>
        {priorityOpen && (
          <div className="absolute bottom-full left-0 mb-1 bg-[#15151f] border border-white/[0.1] rounded-lg overflow-hidden z-10 shadow-xl shadow-black/40 min-w-[120px]">
            {([0, 1, 2, 3, 4] as TaskPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p]
              return (
                <button
                  key={p}
                  onClick={() => batchUpdatePriority(p)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.06] transition-colors ${cfg.color}`}
                >
                  {cfg.icon} {cfg.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <button
        onClick={() => batchUpdateStatus('done')}
        className="p-1.5 rounded-lg text-emerald-400/60 hover:bg-emerald-400/10 transition-colors"
        title="Mark done"
      >
        <CheckCircle2 size={16} />
      </button>

      <button
        onClick={() => batchUpdateStatus('archived')}
        className="p-1.5 rounded-lg text-white/40 hover:bg-white/[0.08] transition-colors"
        title="Archive"
      >
        <Archive size={16} />
      </button>

      {isOwner && (
        <button
          onClick={batchDelete}
          className="p-1.5 rounded-lg text-red-400/60 hover:bg-red-400/10 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="w-[1px] h-5 bg-white/[0.1]" />

      <button
        onClick={clearMultiSelect}
        className="p-1.5 rounded-lg text-white/40 hover:bg-white/[0.08] transition-colors"
        title="Clear selection"
      >
        <X size={14} />
      </button>
    </div>
  )
}
