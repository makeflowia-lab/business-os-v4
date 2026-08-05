'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Volume2, Loader2, AlertCircle } from 'lucide-react'
import { useAudio } from '../contexts/AudioContext'

type TtsState = 'idle' | 'loading' | 'generated' | 'error'

interface AudioButtonProps {
  text: string
  messageId: string
}

export function AudioButton({ text, messageId }: AudioButtonProps) {
  const [state, setState] = useState<TtsState>('idle')
  const urlRef = useRef<string | null>(null)
  const { register } = useAudio()

  useEffect(() => {
    return () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }
  }, [])

  const playAudio = useCallback((url: string) => {
    const el = new Audio(url)
    register(el, messageId)
    el.play().catch(() => {})
  }, [register, messageId])

  const handleClick = useCallback(async () => {
    if (state === 'loading') return
    if (state === 'generated') {
      if (urlRef.current) playAudio(urlRef.current)
      return
    }

    setState('loading')
    try {
      const res = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS ${res.status}`)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = url

      setState('generated')
      playAudio(url)
    } catch {
      setState('error')
    }
  }, [state, text, playAudio])

  const title = {
    idle: 'Escuchar',
    loading: 'Generando audio…',
    generated: 'Reproducir de nuevo',
    error: 'Error — intentar de nuevo',
  }[state]

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      title={title}
      className={`
        flex items-center justify-center min-w-[36px] min-h-[36px] md:min-w-0 md:min-h-0 p-2 md:p-1 rounded-lg md:rounded transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${state === 'generated'
          ? 'text-violet-400/60 hover:text-violet-300'
          : state === 'error'
            ? 'text-red-400/60 hover:text-red-400'
            : 'text-white/25 hover:text-white/60'
        }
        hover:bg-white/[0.06] md:hover:bg-transparent
      `}
    >
      {state === 'loading' && <Loader2 size={14} className="animate-spin" />}
      {state === 'error' && <AlertCircle size={14} />}
      {(state === 'idle' || state === 'generated') && <Volume2 size={14} />}
    </button>
  )
}
