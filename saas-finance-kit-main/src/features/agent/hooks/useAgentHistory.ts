'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  agentHistoryService,
  type AgentSession,
  type AgentActionRecord,
} from '../services/historyService'

interface UseAgentHistoryOptions {
  autoLoad?: boolean
}

export function useAgentHistory(options: UseAgentHistoryOptions = {}) {
  const { autoLoad = true } = options
  const router = useRouter()

  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentActions, setCurrentActions] = useState<AgentActionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  /**
   * Carga la lista de sesiones
   */
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await agentHistoryService.listSessions()
      setSessions(data)
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Error al cargar sesiones')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verificar autenticación y cargar sesiones al montar
  useEffect(() => {
    const supabase = createClient()

    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        router.push('/login')
        return
      }

      setIsAuthenticated(true)
      if (autoLoad) {
        loadSessions()
      }
    }

    checkAuthAndLoad()

    // Escuchar cambios de sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
        loadSessions()
      }
    })

    return () => subscription.unsubscribe()
  }, [autoLoad, router, loadSessions])

  /**
   * Crea una nueva sesión
   */
  const createSession = useCallback(async (title?: string, model?: string) => {
    try {
      setIsSaving(true)
      setError(null)
      const session = await agentHistoryService.createSession(title, model)
      setSessions(prev => [session, ...prev])
      setCurrentSessionId(session.id)
      setCurrentActions([])
      return session
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Error al crear sesión')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  /**
   * Selecciona una sesión y carga sus acciones
   */
  const selectSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setCurrentSessionId(sessionId)
      const actions = await agentHistoryService.loadActions(sessionId)
      setCurrentActions(actions)
      return actions
    } catch (err) {
      console.error('Error loading session:', err)
      setError('Error al cargar sesión')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Guarda una acción en la sesión actual
   */
  const saveAction = useCallback(async (
    actionType: AgentActionRecord['action_type'],
    content: Record<string, unknown>
  ) => {
    if (!currentSessionId) {
      // Crear sesión si no existe
      const session = await createSession()
      const action = await agentHistoryService.saveAction(
        session.id,
        actionType,
        content
      )
      setCurrentActions(prev => [...prev, action])
      return action
    }

    try {
      setIsSaving(true)
      const action = await agentHistoryService.saveAction(
        currentSessionId,
        actionType,
        content
      )
      setCurrentActions(prev => [...prev, action])

      // Actualizar la sesión en la lista (mover al inicio)
      setSessions(prev => {
        const session = prev.find(s => s.id === currentSessionId)
        if (!session) return prev
        const updated = { ...session, updated_at: new Date().toISOString() }
        return [updated, ...prev.filter(s => s.id !== currentSessionId)]
      })

      return action
    } catch (err) {
      console.error('Error saving action:', err)
      setError('Error al guardar acción')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [currentSessionId, createSession])

  /**
   * Guarda múltiples acciones (batch) - útil al final de una respuesta
   */
  const saveActions = useCallback(async (
    actions: Array<{
      actionType: AgentActionRecord['action_type']
      content: Record<string, unknown>
    }>
  ) => {
    if (!currentSessionId) {
      const session = await createSession()
      const saved = await agentHistoryService.saveActions(session.id, actions)
      setCurrentActions(prev => [...prev, ...saved])
      return saved
    }

    try {
      setIsSaving(true)
      const saved = await agentHistoryService.saveActions(currentSessionId, actions)
      setCurrentActions(prev => [...prev, ...saved])

      // Actualizar la sesión en la lista
      setSessions(prev => {
        const session = prev.find(s => s.id === currentSessionId)
        if (!session) return prev
        const updated = { ...session, updated_at: new Date().toISOString() }
        return [updated, ...prev.filter(s => s.id !== currentSessionId)]
      })

      return saved
    } catch (err) {
      console.error('Error saving actions:', err)
      setError('Error al guardar acciones')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [currentSessionId, createSession])

  /**
   * Actualiza el título de la sesión actual
   */
  const updateTitle = useCallback(async (title: string) => {
    if (!currentSessionId) return

    try {
      await agentHistoryService.updateSessionTitle(currentSessionId, title)
      setSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId ? { ...s, title } : s
        )
      )
    } catch (err) {
      console.error('Error updating title:', err)
      setError('Error al actualizar título')
    }
  }, [currentSessionId])

  /**
   * Elimina una sesión
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await agentHistoryService.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))

      // Si es la sesión actual, limpiar
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
        setCurrentActions([])
      }
    } catch (err) {
      console.error('Error deleting session:', err)
      setError('Error al eliminar sesión')
      throw err
    }
  }, [currentSessionId])

  /**
   * Inicia una nueva conversación (limpia estado actual)
   */
  const startNewConversation = useCallback(() => {
    setCurrentSessionId(null)
    setCurrentActions([])
  }, [])

  /**
   * Obtiene la sesión actual
   */
  const currentSession = sessions.find(s => s.id === currentSessionId) || null

  return {
    // Estado
    sessions,
    currentSession,
    currentSessionId,
    currentActions,
    isLoading,
    isSaving,
    error,
    isAuthenticated,

    // Acciones
    loadSessions,
    createSession,
    selectSession,
    saveAction,
    saveActions,
    updateTitle,
    deleteSession,
    startNewConversation,
  }
}
