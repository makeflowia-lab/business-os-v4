import { createClient } from '@/lib/supabase/client'

// Types
export interface AgentSession {
  id: string
  user_id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface AgentActionRecord {
  id: string
  session_id: string
  action_type: 'user_message' | 'think' | 'message' | 'analyze' | 'calculate' | 'recommend' | 'alert'
  content: Record<string, unknown>
  created_at: string
}

export const agentHistoryService = {
  /**
   * Lista las sesiones del usuario actual
   */
  async listSessions(limit = 20): Promise<AgentSession[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Crea una nueva sesión
   */
  async createSession(title?: string, model?: string): Promise<AgentSession> {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('agent_sessions')
      .insert({
        user_id: user.id,
        title: title || 'Nueva sesión',
        model: model || 'haiku-4.5',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Carga las acciones de una sesión
   */
  async loadActions(sessionId: string): Promise<AgentActionRecord[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Guarda una acción en la sesión
   */
  async saveAction(
    sessionId: string,
    actionType: AgentActionRecord['action_type'],
    content: Record<string, unknown>
  ): Promise<AgentActionRecord> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_actions')
      .insert({
        session_id: sessionId,
        action_type: actionType,
        content
      })
      .select()
      .single()

    if (error) throw error

    // Actualizar updated_at de la sesión
    await supabase
      .from('agent_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    return data
  },

  /**
   * Guarda múltiples acciones de una vez (batch)
   */
  async saveActions(
    sessionId: string,
    actions: Array<{
      actionType: AgentActionRecord['action_type']
      content: Record<string, unknown>
    }>
  ): Promise<AgentActionRecord[]> {
    const supabase = createClient()

    const records = actions.map(a => ({
      session_id: sessionId,
      action_type: a.actionType,
      content: a.content,
    }))

    const { data, error } = await supabase
      .from('agent_actions')
      .insert(records)
      .select()

    if (error) throw error

    // Actualizar updated_at de la sesión
    await supabase
      .from('agent_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    return data || []
  },

  /**
   * Actualiza el título de una sesión
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('agent_sessions')
      .update({ title: title.slice(0, 100) })
      .eq('id', sessionId)

    if (error) throw error
  },

  /**
   * Elimina una sesión (cascade elimina las acciones)
   */
  async deleteSession(sessionId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('agent_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
  },

  /**
   * Obtiene una sesión por ID
   */
  async getSession(sessionId: string): Promise<AgentSession | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No encontrado
      throw error
    }
    return data
  },
}
