import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/service'

const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN

// Lazy init VAPID
let vapidReady = false
function ensureVapid() {
  if (vapidReady) return
  const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '').trim()
  const privateKey = (process.env.VAPID_PRIVATE_KEY ?? '').trim()
  if (!publicKey || !privateKey) return
  webpush.setVapidDetails(
    `mailto:${(process.env.VAPID_EMAIL ?? 'admin@example.com').trim()}`,
    publicKey,
    privateKey,
  )
  vapidReady = true
}

/**
 * Background completion endpoint - called by the Agent Server when the agent finishes
 * processing after the browser disconnected. Saves the conversation to Supabase
 * and sends a push notification.
 *
 * Auth: Bearer OPENCLAW_GATEWAY_TOKEN only (server-to-server).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token || token !== OPENCLAW_GATEWAY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { chatSessionId, userMessage, assistantMessage, audioUrl } = (await req.json()) as {
    chatSessionId?: string | null
    userMessage: string
    assistantMessage: string
    audioUrl?: string | null
  }

  if (!userMessage || !assistantMessage) {
    return NextResponse.json({ error: 'userMessage and assistantMessage required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Create session if needed (user navigated away before session was created)
  let sessionId = chatSessionId
  if (!sessionId) {
    const title = userMessage.slice(0, 55) + (userMessage.length > 55 ? '...' : '')
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ title })
      .select('id')
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }
    sessionId = data.id
  }

  // Save messages
  const { error: msgError } = await supabase.from('chat_messages').insert([
    { session_id: sessionId, role: 'user', content: userMessage, audio_url: audioUrl ?? null },
    { session_id: sessionId, role: 'assistant', content: assistantMessage },
  ])
  if (msgError) {
    return NextResponse.json({ error: 'Failed to save messages' }, { status: 500 })
  }

  // Update session timestamp
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  // Send push notification
  ensureVapid()
  if (vapidReady) {
    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    if (subs && subs.length > 0) {
      const payload = JSON.stringify({
        title: 'Assistant',
        body: 'Your response is ready',
        url: '/',
        tag: 'assistant-response',
        icon: '/icon.svg',
      })
      const invalidEndpoints: string[] = []
      await Promise.allSettled(
        subs.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload,
            )
          } catch (err: unknown) {
            const status = (err as { statusCode?: number }).statusCode
            if (status && status >= 400 && status < 500) {
              invalidEndpoints.push(sub.endpoint)
            }
          }
        }),
      )
      if (invalidEndpoints.length > 0) {
        await supabase.from('push_subscriptions').delete().in('endpoint', invalidEndpoints)
      }
    }
  }

  return NextResponse.json({ ok: true, sessionId })
}
