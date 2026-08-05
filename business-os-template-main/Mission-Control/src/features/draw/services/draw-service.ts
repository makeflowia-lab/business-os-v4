import { createClient } from '@/lib/supabase/client'
import type { DrawPage, DrawFolder } from '../types'

const TABLE = 'draw'
const FOLDERS_TABLE = 'draw_folders'

export async function getPages(userId: string): Promise<DrawPage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getDrawData(pageId: string): Promise<DrawPage | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('page_id', pageId)
    .single()

  if (error) throw error
  return data
}

export async function createNewPage(): Promise<DrawPage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: user.id,
      page_elements: { elements: [], files: {} },
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveDrawData(
  pageId: string,
  elements: readonly Record<string, unknown>[],
  name: string,
  files?: Record<string, unknown>,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .update({
      name,
      page_elements: { elements, files: files ?? {} },
      updated_at: new Date().toISOString(),
    })
    .eq('page_id', pageId)

  if (error) throw error
}

export async function renamePage(pageId: string, name: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .update({ name, updated_at: new Date().toISOString() })
    .eq('page_id', pageId)

  if (error) throw error
}

export async function deletePage(pageId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .update({ is_deleted: true })
    .eq('page_id', pageId)

  if (error) throw error
}

export async function movePageToFolder(pageId: string, folderId: string | null): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .update({ folder_id: folderId, updated_at: new Date().toISOString() })
    .eq('page_id', pageId)

  if (error) throw error
}

// ─── Folders ────────────────────────────────────────────────────────────────

export async function getFolders(userId: string): Promise<DrawFolder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(FOLDERS_TABLE)
    .select()
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createFolder(name?: string): Promise<DrawFolder> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from(FOLDERS_TABLE)
    .insert({ user_id: user.id, name: name ?? 'New Folder' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(FOLDERS_TABLE)
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', folderId)

  if (error) throw error
}

export async function deleteFolder(folderId: string): Promise<void> {
  const supabase = createClient()
  // Move all pages in this folder back to root
  await supabase.from(TABLE).update({ folder_id: null }).eq('folder_id', folderId)
  const { error } = await supabase.from(FOLDERS_TABLE).delete().eq('id', folderId)
  if (error) throw error
}
