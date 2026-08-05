import { create } from 'zustand'
import type { TaskWithAssignees } from '@/types/database'

interface TasksState {
  tasks: TaskWithAssignees[]
  selectedTaskId: string | null
  selectedTaskIds: Set<string>
  showArchived: boolean
  focusedTaskId: string | null
  setTasks: (tasks: TaskWithAssignees[]) => void
  addTask: (task: TaskWithAssignees) => void
  updateTask: (id: string, updates: Partial<TaskWithAssignees>) => void
  removeTask: (id: string) => void
  selectTask: (id: string | null) => void
  toggleArchived: () => void
  toggleMultiSelect: (id: string) => void
  selectAll: () => void
  clearMultiSelect: () => void
  isMultiSelected: (id: string) => boolean
  focusTask: (id: string | null) => void
  focusNextTask: (allTaskIds: string[]) => void
  focusPrevTask: (allTaskIds: string[]) => void
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  selectedTaskIds: new Set<string>(),
  showArchived: false,
  focusedTaskId: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => {
    if (s.tasks.some((t) => t.id === task.id)) return s
    return { tasks: [...s.tasks, task] }
  }),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
      focusedTaskId: s.focusedTaskId === id ? null : s.focusedTaskId,
    })),
  selectTask: (id) => set({ selectedTaskId: id }),
  toggleArchived: () => set((s) => ({ showArchived: !s.showArchived })),
  toggleMultiSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedTaskIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedTaskIds: next }
    }),
  selectAll: () =>
    set((s) => ({
      selectedTaskIds: new Set(s.tasks.map((t) => t.id)),
    })),
  clearMultiSelect: () => set({ selectedTaskIds: new Set<string>() }),
  isMultiSelected: (id) => get().selectedTaskIds.has(id),
  focusTask: (id) => set({ focusedTaskId: id }),
  focusNextTask: (allTaskIds) =>
    set((s) => {
      if (allTaskIds.length === 0) return s
      const idx = s.focusedTaskId ? allTaskIds.indexOf(s.focusedTaskId) : -1
      const next = idx < allTaskIds.length - 1 ? idx + 1 : 0
      return { focusedTaskId: allTaskIds[next] }
    }),
  focusPrevTask: (allTaskIds) =>
    set((s) => {
      if (allTaskIds.length === 0) return s
      const idx = s.focusedTaskId ? allTaskIds.indexOf(s.focusedTaskId) : allTaskIds.length
      const prev = idx > 0 ? idx - 1 : allTaskIds.length - 1
      return { focusedTaskId: allTaskIds[prev] }
    }),
}))
