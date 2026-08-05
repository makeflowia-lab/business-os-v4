import { create } from 'zustand'
import type { TaskPriority, TaskStatus } from '@/types/database'

export interface TaskFilters {
  priority: TaskPriority | null
  assigneeId: string | null
  labelId: string | null
  status: TaskStatus | null
  search: string
}

interface FiltersState {
  filters: TaskFilters
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  resetFilters: () => void
  hasActiveFilters: () => boolean
}

const DEFAULT_FILTERS: TaskFilters = {
  priority: null,
  assigneeId: null,
  labelId: null,
  status: null,
  search: '',
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) => set((s) => ({
    filters: { ...s.filters, [key]: value },
  })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  hasActiveFilters: () => {
    const f = get().filters
    return f.priority !== null || f.assigneeId !== null || f.labelId !== null || f.status !== null || f.search.length > 0
  },
}))
