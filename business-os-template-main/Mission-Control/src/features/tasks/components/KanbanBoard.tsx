'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTasksStore } from '@/shared/stores/tasks-store'
import { useFiltersStore } from '@/shared/stores/filters-store'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskDetailPanel } from './TaskDetailPanel'
import { CreateTaskModal } from './CreateTaskModal'
import { FilterBar } from './FilterBar'
import { BatchActionBar } from './BatchActionBar'
import type { TaskStatus, TaskWithAssignees } from '@/types/database'

const VISIBLE_STATUSES: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'done',
]

export function KanbanBoard() {
  const tasks = useTasksStore((s) => s.tasks)
  const showArchived = useTasksStore((s) => s.showArchived)
  const toggleArchived = useTasksStore((s) => s.toggleArchived)
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId)
  const updateTask = useTasksStore((s) => s.updateTask)

  const filters = useFiltersStore((s) => s.filters)

  const [activeTask, setActiveTask] = useState<TaskWithAssignees | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('backlog')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns = showArchived
    ? [...VISIBLE_STATUSES, 'archived' as TaskStatus]
    : VISIBLE_STATUSES

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
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
      archived: [],
    }

    for (const task of filteredTasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    }

    return grouped
  }, [filteredTasks])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as string
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        setActiveTask(task)
      }
    },
    [tasks]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null)

      const { active, over } = event
      if (!over) return

      const taskId = active.id as string
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      let newStatus: TaskStatus

      const overData = over.data.current as
        | { type: string; status?: TaskStatus; task?: TaskWithAssignees }
        | undefined

      if (overData?.type === 'column' && overData.status) {
        newStatus = overData.status
      } else if (overData?.type === 'task' && overData.task) {
        newStatus = overData.task.status
      } else {
        const possibleStatus = over.id as string
        if (columns.includes(possibleStatus as TaskStatus)) {
          newStatus = possibleStatus as TaskStatus
        } else {
          const overTask = tasks.find((t) => t.id === possibleStatus)
          if (overTask) {
            newStatus = overTask.status
          } else {
            return
          }
        }
      }

      if (task.status === newStatus) return

      updateTask(taskId, { status: newStatus })

      const supabase = createClient()
      supabase.from('tasks').update({ status: newStatus }).eq('id', taskId).then()
    },
    [tasks, columns, updateTask]
  )

  const handleAddTask = useCallback((status: TaskStatus) => {
    setCreateDefaultStatus(status)
    setCreateModalOpen(true)
  }, [])

  // Listen for create-task event from command palette
  useEffect(() => {
    const handler = () => handleAddTask('backlog')
    window.addEventListener('openclaw:create-task', handler)
    return () => window.removeEventListener('openclaw:create-task', handler)
  }, [handleAddTask])

  // C key handled by global useGlobalShortcuts via 'openclaw:create-task' event

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <FilterBar />

      {/* Board header actions */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => handleAddTask('backlog')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-white/[0.08] text-white/70 border border-white/[0.1]
            hover:bg-white/[0.12] hover:text-white transition-colors"
        >
          <Plus size={14} />
          New Task
        </button>
        <button
          onClick={toggleArchived}
          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors
            ${showArchived
              ? 'bg-white/[0.08] border-white/[0.12] text-white/60'
              : 'border-white/[0.06] text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
            }`}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-4 overflow-x-auto px-4 pb-4">
            {columns.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onAddTask={handleAddTask}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="w-72">
                <TaskCard task={activeTask} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Modal (overlay) */}
      {selectedTaskId && <TaskDetailPanel />}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultStatus={createDefaultStatus}
      />

      {/* Batch Action Bar */}
      <BatchActionBar />
    </div>
  )
}
