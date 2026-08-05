'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LiveAvatarSession,
  SessionEvent,
  SessionState,
  AgentEventsEnum,
} from '@heygen/liveavatar-web-sdk'

export type AvatarStatus = 'connecting' | 'ready' | 'talking' | 'error' | 'disconnected'

interface HeyGenAvatarProps {
  /** Si true, silencia el audio del avatar (el video sigue moviendo los labios). */
  muted?: boolean
  /** Notifica al padre cada cambio de estado del avatar. */
  onStatusChange?: (status: AvatarStatus) => void
}

declare global {
  interface Window {
    heygenSpeak?: (text: string) => Promise<void>
    heygenStop?: () => Promise<void>
  }
}

/** Limpia markdown y la etiqueta de estado para que la voz suene natural. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\[ESTADO:(humano|soul_reaver)\]\n?/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .trim()
}

export function HeyGenAvatar({ muted = false, onStatusChange }: HeyGenAvatarProps) {
  const [status, setStatus] = useState<AvatarStatus>('connecting')
  const [error, setError] = useState<string | null>(null)

  const sessionRef = useRef<LiveAvatarSession | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const statusCbRef = useRef(onStatusChange)
  statusCbRef.current = onStatusChange

  const setAvatarStatus = (s: AvatarStatus) => {
    setStatus(s)
    statusCbRef.current?.(s)
  }

  // ── Inicializar sesion de LiveAvatar (una sola vez) ──
  useEffect(() => {
    let disposed = false

    async function init() {
      try {
        setAvatarStatus('connecting')

        // 1. Token de sesion (creado en el servidor con la LiveAvatar API key)
        const res = await fetch('/api/heygen-token', { method: 'POST' })
        const data = await res.json().catch(() => null)
        const sessionToken: string | undefined = data?.sessionToken
        if (!res.ok || !sessionToken) {
          throw new Error(data?.error || 'No se obtuvo el token de LiveAvatar.')
        }

        if (disposed) return

        // 2. Crear la sesion. voiceChat:false -> el SDK NO captura el microfono
        //    (Raziel usa su propio reconocimiento de voz del navegador).
        const session = new LiveAvatarSession(sessionToken, { voiceChat: false })
        sessionRef.current = session

        // 3. Eventos
        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (disposed || !videoRef.current) return
          // Engancha video + audio del avatar al elemento <video>
          session.attach(videoRef.current)
          // Arranca silenciado para cumplir el autoplay; el audio se ajusta
          // en el efecto de `muted` (ya con el video reproduciendose).
          videoRef.current.muted = true
          videoRef.current.play().catch(() => {/* el navegador reintenta tras gesto */})
          setAvatarStatus('ready')
        })

        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          if (!disposed) setAvatarStatus('talking')
        })
        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          if (!disposed) setAvatarStatus('ready')
        })
        session.on(SessionEvent.SESSION_DISCONNECTED, () => {
          if (!disposed) setAvatarStatus('disconnected')
        })

        // 4. Iniciar (abre la videollamada en tiempo real; el avatar queda idle)
        await session.start()

        // Si el componente se desmonto durante el arranque (ej. React StrictMode
        // en dev monta dos veces), cerramos esta sesion para no dejar 2 sesiones
        // abiertas — el plan Free solo permite 1 concurrente.
        if (disposed) {
          session.stop().catch(() => {/* ignore */})
        }
      } catch (err) {
        console.error('LiveAvatar init error:', err)
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'No se pudo iniciar el avatar')
          setAvatarStatus('error')
        }
      }
    }

    init()

    // 5. API global: el chat llama a estas funciones para hacer hablar al avatar
    window.heygenSpeak = async (text: string) => {
      const session = sessionRef.current
      const clean = cleanForSpeech(text)
      // Solo si la sesion esta conectada (repeat() lanza error si no lo esta)
      if (!session || !clean || session.state !== SessionState.CONNECTED) return
      try {
        // repeat() = el avatar dice EXACTAMENTE este texto (el cerebro es OpenRouter)
        session.repeat(clean)
      } catch (e) {
        console.error('LiveAvatar speak error:', e)
      }
    }

    window.heygenStop = async () => {
      const session = sessionRef.current
      if (!session || session.state !== SessionState.CONNECTED) return
      try {
        session.interrupt()
      } catch {/* ignore */}
    }

    return () => {
      disposed = true
      delete window.heygenSpeak
      delete window.heygenStop
      sessionRef.current?.stop().catch(() => {/* ignore */})
      sessionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Control de audio (mute/unmute sin cortar la reproduccion) ──
  useEffect(() => {
    const video = videoRef.current
    if (video) video.muted = muted
  }, [muted, status])

  const isLive = status === 'ready' || status === 'talking'

  return (
    <div className="absolute inset-0 w-full h-full bg-[#060810] flex items-center justify-center overflow-hidden">
      {/* Estado de carga */}
      {status === 'connecting' && (
        <div className="absolute z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
          <p className="text-[#00d4ff] animate-pulse tracking-widest text-sm uppercase">
            Despertando a Raziel...
          </p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="absolute z-10 max-w-md text-center text-red-300 bg-red-500/10 border border-red-500/30 px-6 py-4 rounded-xl">
          <p className="font-semibold mb-1">No se pudo conectar el avatar</p>
          <p className="text-xs text-red-300/80">{error}</p>
        </div>
      )}

      {/* Desconectado */}
      {status === 'disconnected' && (
        <div className="absolute z-10 text-center text-[#94a3b8] bg-[#0d1117]/80 border border-[#1a2744] px-6 py-4 rounded-xl">
          <p className="text-sm">Sesion finalizada. Recarga la pagina para reconectar.</p>
        </div>
      )}

      {/* Video del avatar (WebRTC en tiempo real) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Vineta para integrar el video con la UI oscura */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-transparent to-[#060810]/40 pointer-events-none" />

      {/* Indicador EN VIVO / HABLANDO */}
      {isLive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1117]/70 border border-[#1a2744] backdrop-blur-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'talking'
                ? 'bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.9)] animate-pulse'
                : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]'
            }`}
          />
          <span className="text-[10px] tracking-widest uppercase text-[#94a3b8]">
            {status === 'talking' ? 'Hablando' : 'En vivo'}
          </span>
        </div>
      )}
    </div>
  )
}
