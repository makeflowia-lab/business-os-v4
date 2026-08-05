export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string // ISO date string
  end: string
  allDay: boolean
  account: 'personal' | 'business' | 'tasks'
  color?: string
  location?: string
  taskId?: string
}

export type CalendarView = 'month' | 'week' | 'day'

export type AccountFilter = 'all' | 'personal' | 'business' | 'tasks'
