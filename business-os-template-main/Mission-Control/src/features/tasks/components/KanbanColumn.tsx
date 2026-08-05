'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import type { TaskStatus, TaskWithAssignees } from '@/types/database'

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To-do',
  in_progress: 'In Progress',
  done: 'Done',
  archived: 'Archived',
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: TaskWithAssignees[]
  onAddTask?: (status: TaskStatus) => void
}

export function KanbanColumn({ status, tasks, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-72 flex flex-col
        bg-white/[0.03] backdrop-blur-sm border rounded-2xl
        transition-colors duration-200
        ${isOver ? 'border-white/[0.12] bg-white/[0.05]' : 'border-white/[0.06]'}
      `}
    >
      {/* Specular rim */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

      {/* Column Header */}
      <div className="relative px-3 pt-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
              {STATUS_LABELS[status]}
            </h3>
            <span className="text-[10px] font-medium text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full min-w-[24px] text-center">
              {tasks.length}
            </span>
          </div>
          {onAddTask && (
            <button
              onClick={() => onAddTask(status)}
              className="p-1 rounded-md hover:bg-white/[0.08] text-white/30 hover:text-white/60 transition-colors"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="flex items-center justify-center h-20">
              <p className="text-xs text-white/20">No tasks</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
