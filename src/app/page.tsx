'use client'

import { useChat } from 'ai/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Send, Mic, Volume2, VolumeX, Square, Trash2, Eye, EyeOff } from 'lucide-react'
import { HeyGenAvatar, type AvatarStatus } from '@/features/raziel/components/HeyGenAvatar'
import { ChatMessage, TypingIndicator } from '@/features/raziel/components/ChatMessage'
import { useVoice } from '@/features/raziel/hooks/useVoice'

const HISTORY_KEY = 'raziel-history-v1'

function loadHistory(): any[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

type AvatarState = 'humano' | 'soul_reaver'

function detectState(content: string): AvatarState | null {
  const match = content.match(/^\[ESTADO:(humano|soul_reaver)\]/)
  if (match) return match[1] as AvatarState
  return null
}

function cleanContent(content: string): string {
  return content.replace(/^\[ESTADO:(humano|soul_reaver)\]\n?/, '').trim()
}

export default function RazielPage() {
  const [avatarState, setAvatarState] = useState<AvatarState>('humano')
  const [avatarStatus, setAvatarStatus] = useState<AvatarStatus>('connecting')
  const [avatarStarted, setAvatarStarted] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const startAvatar = () => {
    setSessionKey((k) => k + 1)
    setAvatarStatus('connecting')
    setAvatarStarted(true)
  }

  const {
    startListening, stopListening, isListening, interimText,
    autoSpeak, setAutoSpeak,
  } = useVoice()

  const isTalking = avatarStatus === 'talking'

  // ── Habla por frases conforme llega el stream (en vez de esperar la respuesta
  //    completa). Esto reduce mucho el retardo percibido del avatar. ──
  const autoSpeakRef = useRef(autoSpeak)
  autoSpeakRef.current = autoSpeak
  const spokenRef = useRef<{ id: string; len: number }>({ id: '', len: 0 })
  const speakStream = useCallback((id: string, cleanFull: string, final: boolean) => {
    if (!autoSpeakRef.current) return
    if (spokenRef.current.id !== id) spokenRef.current = { id, len: 0 }
    const pending = cleanFull.slice(spokenRef.current.len)
    if (!pending.trim() && !final) return
    let chunk = ''
    if (final) {
      chunk = pending // vacía la última frase parcial
    } else {
      const m = pending.match(/[\s\S]*[.!?…\n]/) // hasta el último cierre de frase
      chunk = m ? m[0] : ''
    }
    if (chunk.trim()) {
      window.heygenSpeak?.(chunk)
      spokenRef.current = { id, len: spokenRef.current.len + chunk.length }
    }
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const content = typeof message.content === 'string' ? message.content : ''
      const state = detectState(content)
      if (state) setAvatarState(state)
      // Dice la última frase que falte (lo demás ya se fue diciendo durante el stream)
      speakStream(message.id, cleanContent(content), true)
    },
  })

  // Detecta el estado y habla por frases mientras llega el stream
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role === 'assistant') {
      const content = typeof last.content === 'string' ? last.content : ''
      const state = detectState(content)
      if (state) setAvatarState(state)
      // Solo mientras se está generando (isLoading) y con el avatar activo,
      // para no leer en voz alta el historial al cargar o reconectar.
      if (avatarStarted && isLoading) speakStream(last.id, cleanContent(content), false)
    }
  }, [messages, avatarStarted, isLoading, speakStream])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Load history from localStorage ONLY on client (avoids hydration mismatch)
  useEffect(() => {
    const saved = loadHistory()
    if (saved.length > 0) setMessages(saved)
    setMounted(true)
  }, [setMessages])

  // Persist history to localStorage
  useEffect(() => {
    if (!mounted) return
    if (messages.length === 0) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
    } catch { /* quota exceeded — ignore */ }
  }, [messages, mounted])

  const clearHistory = () => {
    if (!confirm('¿Borrar todo el historial de conversación?')) return
    try { localStorage.removeItem(HISTORY_KEY) } catch { /* ignore */ }
    setMessages([])
    setAvatarState('humano')
  }

  const isThinking = isLoading

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const handleMic = () => {
    if (isListening) return  // stop is handled by the send button
    startListening((transcript) => {
      append({ role: 'user', content: transcript })
    })
  }

  const handleMicSend = () => {
    stopListening()  // stops recording and triggers onResult → append
  }

  return (
    <div className="h-screen flex flex-col bg-[#060810] bg-particles overflow-hidden min-h-screen">

      {/* ── Header (menú superior — se mantiene) ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2744] bg-[#0d1117]/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-colors duration-700
            ${avatarState === 'soul_reaver'
              ? 'bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.9)]'
              : 'bg-[#c4a882] shadow-[0_0_6px_rgba(196,168,130,0.6)]'}`}
          />
          <span className="text-[#e2e8f0] font-semibold tracking-wide">Raziel</span>
          <span className="text-xs text-[#64748b] tracking-widest uppercase">Asesor Comercial</span>
          <Link href="/avatar" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Avatar
          </Link>
          <Link href="/oferta" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Oferta
          </Link>
          <Link href="/propuesta" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Propuesta
          </Link>
          <Link href="/auditoria" className="text-[10px] text-[#475569] hover:text-red-400 border border-[#1a2744] hover:border-red-400/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Auditoría
          </Link>
          <Link href="/legal" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Legal
          </Link>
          <Link href="/contenido" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Contenido
          </Link>
          <Link href="/docs-proyecto" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Docs
          </Link>
          <Link href="/branding" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Branding
          </Link>
          <Link href="/business-os" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            Business OS
          </Link>
          <Link href="/cfo" className="text-[10px] text-[#475569] hover:text-[#00d4ff] border border-[#1a2744] hover:border-[#00d4ff]/40 rounded-lg px-2 py-1 transition-all duration-200 tracking-widest uppercase">
            CFO
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <span className={`text-xs transition-colors duration-500
            ${avatarState === 'soul_reaver' ? 'text-[#00d4ff]' : 'text-[rgba(196,168,130,0.6)]'}`}>
            {avatarState === 'soul_reaver' ? 'Soul Reaver activo' : 'Modo humano'}
          </span>

          {/* Auto-speak toggle */}
          <button
            type="button"
            onClick={() => { setAutoSpeak(!autoSpeak); window.heygenStop?.() }}
            title={autoSpeak ? 'Desactivar voz' : 'Activar voz'}
            aria-label={autoSpeak ? 'Desactivar voz' : 'Activar voz'}
            className={`p-1.5 rounded-lg transition-all duration-200
              ${autoSpeak
                ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]'
                : 'text-[#475569] hover:text-[#64748b] border border-[#1a2744]'}`}
          >
            {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Mostrar/ocultar transcripción de la conversación */}
          {mounted && messages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              title={showTranscript ? 'Ocultar conversación' : 'Mostrar conversación'}
              aria-label={showTranscript ? 'Ocultar conversación' : 'Mostrar conversación'}
              className={`p-1.5 rounded-lg transition-all duration-200
                ${showTranscript
                  ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)]'
                  : 'text-[#475569] hover:text-[#64748b] border border-[#1a2744]'}`}
            >
              {showTranscript ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}

          {/* Stop speaking */}
          {isTalking && (
            <button
              type="button"
              onClick={() => window.heygenStop?.()}
              title="Detener voz"
              aria-label="Detener voz"
              className="p-1.5 rounded-lg text-[#f97316] border border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.1)]"
            >
              <Square size={14} />
            </button>
          )}

          {/* Clear history — only render after mount to avoid hydration mismatch */}
          {mounted && messages.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              title="Limpiar historial"
              aria-label="Limpiar historial"
              className="p-1.5 rounded-lg text-[#475569] hover:text-red-400 border border-[#1a2744] hover:border-red-400/40 transition-all duration-200"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Zona central: VIDEO arriba; transcripción en panel APARTE debajo ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Escenario del video del avatar (el texto NO se superpone aquí) */}
        <div className="relative flex-1 overflow-hidden">
          {!avatarStarted ? (
            /* Puerta de activacion — ahorra creditos (no conecta en cada recarga)
               y el clic habilita el autoplay con audio del navegador. */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.9)] animate-pulse" />
                <p className="text-[#e2e8f0] text-lg font-semibold">Raziel está listo para aparecer en vivo</p>
                <p className="text-[#64748b] text-xs max-w-sm leading-relaxed">
                  Plan Free de LiveAvatar: cada sesión dura máximo 2 minutos y consume crédito.
                  Pulsa para que Raziel aparezca y te espere.
                </p>
              </div>
              <button
                type="button"
                onClick={startAvatar}
                className="px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium
                  shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all duration-200"
              >
                ▶ Activar Raziel en vivo
              </button>
            </div>
          ) : (
            <>
              {/* Video WebRTC del avatar (ocupa todo el escenario) */}
              <HeyGenAvatar key={sessionKey} muted={!autoSpeak} onStatusChange={setAvatarStatus} />

              {/* Reconexión cuando la sesión termina (límite de 2 min en plan Free) */}
              {avatarStatus === 'disconnected' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={startAvatar}
                    className="px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium
                      shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all duration-200"
                  >
                    ↻ Reconectar a Raziel
                  </button>
                </div>
              )}

              {/* Pista de bienvenida cuando no hay conversación */}
              {mounted && messages.length === 0 && (avatarStatus === 'ready' || avatarStatus === 'talking') && (
                <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center pointer-events-none">
                  <p className="text-[#94a3b8] text-sm bg-[#0d1117]/60 border border-[#1a2744] rounded-full px-4 py-2 backdrop-blur-sm">
                    Habla o escribe para comenzar — Raziel te escucha
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Transcripción en VENTANA APARTE debajo del video (oculta por defecto;
            se muestra con el botón 👁 del header). No tapa al avatar. */}
        {showTranscript && messages.length > 0 && (
          <div className="flex-shrink-0 max-h-[38%] overflow-y-auto border-t border-[#1a2744] bg-[#0a0e18] px-4 md:px-8 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isThinking && messages[messages.length - 1]?.role === 'user' && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── Barra de entrada (parte inferior — se mantiene) ── */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t border-[#1a2744] bg-[#090c14]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end max-w-3xl mx-auto">

          {/* Mic button */}
          <button
            type="button"
            onClick={handleMic}
            disabled={isListening}
            title="Hablar con Raziel"
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
              ${isListening
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.7)] animate-pulse cursor-default'
                : 'bg-[#0d1117] border border-[#1a2744] text-[#64748b] hover:border-[#0ea5e9] hover:text-[#0ea5e9]'}`}
          >
            <Mic size={16} />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={isListening ? interimText : input}
              onChange={isListening ? undefined : handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎙 Escuchando...' : 'Habla o escribe con Raziel...'}
              readOnly={isListening}
              rows={1}
              disabled={isLoading}
              className={`w-full resize-none rounded-xl px-4 py-3 text-sm textarea-field-size
                bg-[#0d1117] border text-[#e2e8f0]
                placeholder-[#475569] outline-none
                transition-all duration-200 max-h-32
                ${isListening
                  ? 'border-red-500/60 ring-1 ring-red-500/30 text-[#94a3b8] italic'
                  : 'border-[#1a2744] focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]/30'}
                ${isLoading ? 'opacity-60' : ''}`}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5">
                <span className="mic-bar mic-bar-1 w-1 h-3 bg-red-500 rounded-full" />
                <span className="mic-bar mic-bar-2 w-1 h-3 bg-red-500 rounded-full" />
                <span className="mic-bar mic-bar-3 w-1 h-3 bg-red-500 rounded-full" />
              </div>
            )}
          </div>

          {/* Send / Stop-and-send button */}
          {isListening ? (
            <button
              type="button"
              onClick={handleMicSend}
              aria-label="Detener y enviar"
              title="Detener y enviar"
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
                bg-red-600 hover:bg-red-700 text-white transition-all duration-200
                shadow-[0_0_12px_rgba(220,38,38,0.5)]"
            >
              <Send size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
                bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#1a2744] disabled:text-[#475569]
                text-white transition-all duration-200 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between mt-2 px-1 max-w-3xl mx-auto">
          <p className="text-[10px] text-[#475569]">
            {isListening
              ? '🔴 Grabando... toca el micrófono para enviar'
              : 'Enter enviar · Shift+Enter nueva línea · 🎙 micrófono para voz'}
          </p>
          <p className={`text-[10px] transition-colors ${autoSpeak ? 'text-[#00d4ff]' : 'text-[#475569]'}`}>
            {autoSpeak ? '🔊 Voz activada' : '🔇 Voz desactivada'}
          </p>
        </div>
      </div>
    </div>
  )
}
