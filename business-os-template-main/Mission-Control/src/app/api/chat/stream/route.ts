import { createClient } from '@/lib/supabase/server'

const AGENT_URL = process.env.AGENT_URL ?? 'http://localhost:3099'
const AGENT_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? ''

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const message = body['message']
  if (typeof message !== 'string' || !message.trim()) {
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400 })
  }

  try {
    const upstream = await fetch(`${AGENT_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGENT_TOKEN}`,
      },
      body: JSON.stringify({
        message: message.trim(),
        ...(typeof body['effort'] === 'string' && { effort: body['effort'] }),
        ...(typeof body['chatSessionId'] === 'string' && { chatSessionId: body['chatSessionId'] }),
        ...(typeof body['audioUrl'] === 'string' && { audioUrl: body['audioUrl'] }),
        ...(typeof body['imageUrl'] === 'string' && { imageUrl: body['imageUrl'] }),
        ...(typeof body['context'] === 'string' && { context: body['context'] }),
      }),
      signal: request.signal,
    })

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text()
      return new Response(text, { status: upstream.status })
    }

    // Proxy the SSE stream from Agent Server to the browser
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Browser disconnected - expected for background processing
      return new Response(null, { status: 499 })
    }
    if (err instanceof Error && err.name === 'TimeoutError') {
      return new Response(JSON.stringify({ error: 'Agent timeout' }), { status: 504 })
    }
    return new Response(
      JSON.stringify({ error: 'Agent Server unreachable. Make sure it is running locally.' }),
      { status: 503 },
    )
  }
}
