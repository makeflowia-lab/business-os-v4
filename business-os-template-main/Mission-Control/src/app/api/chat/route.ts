import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const AGENT_URL = process.env.AGENT_URL ?? 'http://localhost:3099'
const AGENT_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function POST(request: Request) {
  // Require authenticated session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const endpoint = body['action'] === 'newchat' ? '/newchat' : '/chat'

  try {
    const res = await fetch(`${AGENT_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGENT_TOKEN}`,
      },
      body: JSON.stringify({ message: body['message'] }),
      // 10 min timeout — matches agent AGENT_TIMEOUT_MS
      signal: AbortSignal.timeout(600_000),
    })

    const data: unknown = await res.json()
    // Pass through all fields including compact metadata and slashCommands
    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Agent timeout — try again' }, { status: 504 })
    }
    return NextResponse.json(
      { error: 'Agent server unreachable. Make sure it is running.' },
      { status: 503 },
    )
  }
}
