'use client'
import { useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { useFiltersStore } from '@/shared/stores/filters-store'
import { PRIORITY_CONFIG, STATUS_CONFIG as SHARED_STATUS_CONFIG, formatDueDate, getDueDateColor } from '../utils/priority'
import { TaskDetailPanel } from './TaskDetailPanel'
import { CreateTaskModal } from './CreateTaskModal'
import { FilterBar } from './FilterBar'
import { BatchActionBar } from './BatchActionBar'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import type { TaskStatus, TaskWithAssignees } from '@/types/database'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'bg-white/[0.08]' },
  todo: { label: 'To-do', color: 'bg-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500/20' },
  done: { label: 'Done', color: 'bg-emerald-500/20' },
  archived: { label: 'Archived', color: 'bg-white/[0.04]' },
}

const VISIBLE_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'done']

export function ListView() {
  const tasks = useTasksStore((s) => s.tasks)
  const showArchived = useTasksStore((s) => s.showArchived)
  const toggleArchived = useTasksStore((s) => s.toggleArchived)
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)
  const selectTask = useTasksStore((s) => s.selectTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const toggleMultiSelect = useTasksStore((s) => s.toggleMultiSelect)
  const selectedTaskIds = useTasksStore((s) => s.selectedTaskIds)

  const filters = useFiltersStore((s) => s.filters)

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('backlog')

  const statuses = showArchived ? [...VISIBLE_STATUSES, 'archived' as TaskStatus] : VISIBLE_STATUSES

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.priority !== null && (task.priority ?? 0) !== filters.priority) return false
      if (filters.assigneeId && !task.assignees.some((a) => a.id === filters.assigneeId)) return false
      if (filters.labelId && !(task.labels ?? []).some((l) => l.id === filters.labelId)) return false
      if (filters.status !== null && task.status !== filters.status) return false
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [tasks, filters])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithAssignees[]> = {
      backlog: [], todo: [], in_progress: [], done: [], archived: [],
    }
    for (const task of filteredTasks) {
      if (grouped[task.status]) grouped[task.status].push(task)
    }
    return grouped
  }, [filteredTasks])

  const toggleGroup = (status: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus })
    const supabase = createClient()
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }, [updateTask])

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <FilterBar />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => { setCreateDefaultStatus('backlog'); setCreateModalOpen(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.08] text-white/70 border border-white/[0.1] hover:bg-white/[0.12] hover:text-white transition-colors"
        >
          <Plus size={14} />
          New Task
        </button>
        <button
          onClick={toggleArchived}
          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors
            ${showArchived ? 'bg-white/[0.08] border-white/[0.12] text-white/60' : 'border-white/[0.06] text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}`}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Table */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0f] grid grid-cols-[60px_1fr_100px_100px_100px_80px] gap-2 px-3 py-2 border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-white/30 font-semibold">
            <span>ID</span>
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due</span>
            <span>Est.</span>
          </div>

          {/* Grouped rows */}
          {statuses.map((status) => {
            const statusTasks = tasksByStatus[status]
            const isCollapsed = collapsedGroups.has(status)
            const config = STATUS_CONFIG[status]

            return (
              <div key={status} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(status)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  {isCollapsed ? <ChevronRight size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
                  <span className={`w-2 h-2 rounded-full ${config.color}`} />
                  <span className="text-xs font-medium text-white/60">{config.label}</span>
                  <span className="text-[10px] text-white/25 bg-white/[0.06] px-1.5 py-0.5 rounded-full">{statusTasks.length}</span>
                </button>

                {/* Task rows */}
                {!isCollapsed && statusTasks.map((task) => {
                  const priority = task.priority ?? 0
                  const pConfig = PRIORITY_CONFIG[priority]
                  const dueDateStr = formatDueDate(task.due_at)
                  const dueDateColor = getDueDateColor(task.due_at)
                  const isSelected = selectedTaskId === task.id

                  const sConfig = SHARED_STATUS_CONFIG[task.status]

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        if (e.shiftKey || e.metaKey) {
                          e.preventDefault()
                          toggleMultiSelect(task.id)
                        } else {
                          selectTask(task.id)
                        }
                      }}
                      className={`grid grid-cols-[60px_1fr_100px_100px_100px_80px] gap-2 items-center px-3 py-2 rounded-lg cursor-pointer transition-colors
                        ${isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}
                        ${selectedTaskIds.has(task.id) ? 'ring-1 ring-purple-500/40 bg-purple-500/[0.06]' : ''}
                      `}
                    >
                      {/* ID */}
                      <span className="text-[11px] font-mono text-white/35 flex items-center gap-1">
                        <span className={`leading-none ${sConfig.color}`}>{sConfig.icon}</span>
                        MC-{task.sequence_number}
                      </span>

                      {/* Title + assignee */}
                      <div className="flex items-center gap-2 min-w-0">
                        {task.assignees[0] && (
                          task.assignees[0].avatar_url
                            ? <img src={task.assignees[0].avatar_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                            : <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] text-white/50 flex-shrink-0">
                                {(task.assignees[0].full_name ?? '?')[0]}
                              </span>
                        )}
                        <span className="text-sm text-white truncate">{task.title}</span>
                        {(task.labels ?? []).length > 0 && (
                          <div className="flex gap-1 flex-shrink-0">
                            {(task.labels ?? []).slice(0, 2).map((l) => (
                              <span key={l.id} className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <select
                        value={task.status}
                        onChange={(e) => { e.stopPropagation(); handleStatusChange(task.id, e.target.value as TaskStatus) }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-[11px] text-white/50 outline-none cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>

                      {/* Priority */}
                      <span className={`text-[11px] ${pConfig.color}`}>
                        {priority > 0 ? `${pConfig.icon} ${pConfig.label}` : '—'}
                      </span>

                      {/* Due date */}
                      <span className={`text-[11px] ${dueDateColor}`}>
                        {dueDateStr || '—'}
                      </span>

                      {/* Estimate */}
                      <span className="text-[11px] text-white/30">
                        {task.estimate ? `${task.estimate}pt` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Detail Panel */}
        {selectedTaskId && <TaskDetailPanel />}
      </div>

      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultStatus={createDefaultStatus}
      />

      <BatchActionBar />
    </div>
  )
}
