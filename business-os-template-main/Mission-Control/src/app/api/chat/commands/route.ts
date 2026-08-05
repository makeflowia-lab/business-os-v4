import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AGENT_URL = process.env.AGENT_URL ?? 'http://localhost:3099'
const AGENT_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${AGENT_URL}/commands`, {
      headers: { Authorization: `Bearer ${AGENT_TOKEN}` },
      signal: AbortSignal.timeout(5_000),
    })
    const data: unknown = await res.json()
    return NextResponse.json(data)
  } catch {
    // Agent offline — return static fallback so UI still works
    return NextResponse.json({
      commands: [
        { name: '/clear',   description: 'Nueva conversación — borra el historial' },
        { name: '/compact', description: 'Comprime el contexto (reduce tokens usados)' },
        { name: '/status',  description: 'Estado del agente: modelo, tareas activas, sesión' },
        { name: '/tasks',   description: 'Tareas actuales del Kanban board' },
        { name: '/agents',  description: 'Estado en vivo de todos los agentes' },
        { name: '/context', description: 'Cuánto contexto se está usando (tokens)' },
        { name: '/help',    description: 'Ver todos los comandos disponibles' },
      ],
    })
  }
}
