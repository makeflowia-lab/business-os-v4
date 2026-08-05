export interface DrawPage {
  page_id: string
  user_id: string
  name: string
  page_elements: DrawElements | null
  agent_version: number
  is_deleted: boolean
  folder_id: string | null
  created_at: string
  updated_at: string
}

export interface DrawFolder {
  id: string
  user_id: string
  name: string
  position: number
  created_at: string
  updated_at: string
}

export interface DrawElements {
  elements: readonly Record<string, unknown>[]
  files?: Record<string, unknown>
}
