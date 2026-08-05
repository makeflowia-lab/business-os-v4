import { createClient } from '@/lib/supabase/server'

const AGENT_URL = process.env.AGENT_URL ?? 'http://localhost:3099'
const AGENT_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const upstream = await fetch(`${AGENT_URL}/models`, {
      headers: { Authorization: `Bearer ${AGENT_TOKEN}` },
      signal: AbortSignal.timeout(15_000),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return new Response(text, { status: upstream.status })
    }

    const data = await upstream.json()
    return Response.json(data)
  } catch {
    return new Response(
      JSON.stringify({ error: 'Agent Server unreachable' }),
      { status: 503 },
    )
  }
}
