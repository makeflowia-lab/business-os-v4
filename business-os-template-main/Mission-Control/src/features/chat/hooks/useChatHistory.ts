'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ChatSession {
  id: string
  title: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface PersistedMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  audio_url?: string | null
  image_url?: string | null
  metadata?: { source?: string; jobId?: string; jobLabel?: string } | null
}

function sessionSort(a: ChatSession, b: ChatSession): number {
  const aIsAuto = a.title === 'Automations'
  const bIsAuto = b.title === 'Automations'
  if (aIsAuto !== bIsAuto) return aIsAuto ? -1 : 1
  if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
  return b.updated_at.localeCompare(a.updated_at)
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  // Load session list on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(30)
    const sorted = ((data as ChatSession[]) ?? []).sort(sessionSort)
    setSessions(sorted)
    setLoading(false)
  }, [])

  const createSession = useCallback(async (firstMessage: string): Promise<ChatSession> => {
    const supabase = createClient()
    // Optimistic title while AI generates
    const fallbackTitle = firstMessage.slice(0, 55) + (firstMessage.length > 55 ? '...' : '')

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ title: fallbackTitle })
      .select()
      .single()
    if (error || !data) throw new Error(error?.message ?? 'Failed to create session')
    const session = data as ChatSession
    setSessions((prev) => [session, ...prev])

    // Generate AI title in background
    fetch('/api/chat/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: firstMessage }),
    })
      .then((r) => r.json())
      .then(({ title }: { title?: string }) => {
        if (!title || title === fallbackTitle) return
        supabase.from('chat_sessions').update({ title }).eq('id', session.id)
        setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, title } : s))
      })
      .catch(() => { /* silent */ })

    return session
  }, [])

  const updateSessionTimestamp = useCallback(async (sessionId: string) => {
    const supabase = createClient()
    const now = new Date().toISOString()
    await supabase
      .from('chat_sessions')
      .update({ updated_at: now })
      .eq('id', sessionId)
    setSessions((prev) =>
      prev
        .map((s) => (s.id === sessionId ? { ...s, updated_at: now } : s))
        .sort(sessionSort),
    )
  }, [])

  const saveMessages = useCallback(
    async (
      sessionId: string,
      messages: Array<{ role: 'user' | 'assistant'; content: string; audioUrl?: string; imageUrl?: string }>,
    ) => {
      const supabase = createClient()
      await supabase.from('chat_messages').insert(
        messages.map((m) => ({
          session_id: sessionId,
          role: m.role,
          content: m.content,
          audio_url: m.audioUrl ?? null,
          image_url: m.imageUrl ?? null,
        })),
      )
      await updateSessionTimestamp(sessionId)
    },
    [updateSessionTimestamp],
  )

  const loadMessages = useCallback(async (sessionId: string): Promise<PersistedMessage[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    return (data as PersistedMessage[]) ?? []
  }, [])

  const deleteSession = useCallback(async (sessionId: string) => {
    const supabase = createClient()
    await supabase.from('chat_sessions').delete().eq('id', sessionId)
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }, [])

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const supabase = createClient()
    await supabase.from('chat_sessions').update({ title: trimmed }).eq('id', sessionId)
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: trimmed } : s))
  }, [])

  const toggleFavorite = useCallback(async (sessionId: string) => {
    const supabase = createClient()
    const target = sessions.find((s) => s.id === sessionId)
    if (!target) return
    const next = !target.is_favorite
    await supabase.from('chat_sessions').update({ is_favorite: next }).eq('id', sessionId)
    setSessions((prev) =>
      prev
        .map((s) => (s.id === sessionId ? { ...s, is_favorite: next } : s))
        .sort(sessionSort),
    )
  }, [sessions])

  return {
    sessions,
    loading,
    loadSessions,
    createSession,
    saveMessages,
    loadMessages,
    deleteSession,
    renameSession,
    toggleFavorite,
  }
}
