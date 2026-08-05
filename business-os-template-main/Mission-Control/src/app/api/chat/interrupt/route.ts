import { createClient } from '@/lib/supabase/server'

const AGENT_URL = process.env.AGENT_URL ?? 'http://localhost:3099'
const AGENT_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const upstream = await fetch(`${AGENT_URL}/chat/interrupt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGENT_TOKEN}`,
      },
      signal: AbortSignal.timeout(10_000),
    })

    const data = await upstream.json()
    return Response.json(data)
  } catch {
    return new Response(
      JSON.stringify({ ok: true, message: 'Interrupt request failed, falling back to abort' }),
      { status: 200 },
    )
  }
}
