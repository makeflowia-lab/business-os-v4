import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaskStatus, TaskPriority } from '@/types/database'

export interface TaskTemplate {
  id: string
  name: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  estimate: number | null
  labelIds: string[]
  createdAt: string
}

interface TemplatesState {
  templates: TaskTemplate[]
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => void
  removeTemplate: (id: string) => void
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) =>
        set((s) => ({
          templates: [
            ...s.templates,
            {
              ...template,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),
      updateTemplate: (id, updates) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
    }),
    {
      name: 'task-templates',
    }
  )
)
