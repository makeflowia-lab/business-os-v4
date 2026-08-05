import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'STT not configured' }, { status: 503 })
  }

  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  if (!audio) {
    return NextResponse.json({ error: 'audio is required' }, { status: 400 })
  }

  // Groq Whisper — fast, accurate, free tier
  const upstream = new FormData()
  upstream.append('file', audio, 'recording.webm')
  upstream.append('model', 'whisper-large-v3-turbo')
  upstream.append('language', 'es')
  upstream.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: upstream,
  })

  if (!res.ok) {
    const body = await res.text()
    return NextResponse.json({ error: body }, { status: res.status })
  }

  const data = await res.json() as { text?: string }
  return NextResponse.json({ text: data.text?.trim() ?? '' })
}
