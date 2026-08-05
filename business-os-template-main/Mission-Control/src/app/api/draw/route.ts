import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Owner user ID — the authenticated user who owns drawings created by the agent
// Falls back to the requesting agent's token auth (no user context)
const OWNER_USER_ID = process.env.OWNER_USER_ID ?? ''

/**
 * POST /api/draw — Create a drawing from an external agent
 *
 * Auth: Bearer token (OPENCLAW_GATEWAY_TOKEN)
 * Body: { name: string, elements: object[], files?: object }
 *
 * Returns: { ok: true, page_id: string, url: string }
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.OPENCLAW_GATEWAY_TOKEN

    if (!expectedToken) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const token = authHeader?.replace('Bearer ', '')
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, elements, files } = body as {
      name?: string
      elements?: unknown[]
      files?: Record<string, unknown>
    }

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { error: 'Missing or invalid "elements" array' },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()

    const pageElements = JSON.stringify({ elements, files: files ?? {} })

    const { data, error } = await supabase.rpc('create_draw_from_agent', {
      p_user_id: OWNER_USER_ID,
      p_name: name || 'Agent Diagram',
      p_elements: pageElements,
    })

    if (error) {
      console.error('[api/draw] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const pageId = data as string
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const url = `${siteUrl}/draw/${pageId}`

    return NextResponse.json({ ok: true, page_id: pageId, url })
  } catch (err) {
    console.error('[api/draw] Unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
