'use client'

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { Send, X, Copy, Check, AlertCircle, PanelRightClose } from 'lucide-react'
import { useChat, ChatMessage } from '@/features/chat/hooks/useChat'
import { useChatHistory, ChatSession } from '@/features/chat/hooks/useChatHistory'
import { MarkdownMessage } from '@/features/chat/components/MarkdownMessage'
import { AudioButton } from '@/features/chat/components/AudioButton'

import { AudioProvider } from '@/features/chat/contexts/AudioContext'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

interface DrawChatPanelProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null
  onClose: () => void
}

// ─── Mermaid → Canvas injection ──────────────────────────────────────────────

async function injectMermaidToCanvas(
  code: string,
  api: ExcalidrawImperativeAPI,
) {
  const { parseMermaidToExcalidraw } = await import(
    '@excalidraw/mermaid-to-excalidraw'
  )
  const { convertToExcalidrawElements } = await import(
    '@excalidraw/excalidraw'
  )

  const { elements: skeletons, files } = await parseMermaidToExcalidraw(code)
  const elements = convertToExcalidrawElements(skeletons)

  api.updateScene({ elements: [...api.getSceneElements(), ...elements] })

  if (files) {
    const fileValues = Object.values(files) as Parameters<
      typeof api.addFiles
    >[0]
    api.addFiles(fileValues)
  }

  api.scrollToContent(elements, { fitToContent: true })
}

// ─── Extract mermaid blocks from markdown ────────────────────────────────────

function extractMermaidBlocks(content: string): string[] {
  const regex = /```mermaid\n([\s\S]*?)```/g
  const blocks: string[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim())
  }
  return blocks
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      title="Copiar"
      className="p-0.5 rounded text-white/20 hover:text-white/50 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  )
}

// ─── Message bubble (compact) ────────────────────────────────────────────────

function Bubble({
  msg,
  excalidrawAPI,
}: {
  msg: ChatMessage
  excalidrawAPI: ExcalidrawImperativeAPI | null
}) {
  const isUser = msg.role === 'user'
  const [injecting, setInjecting] = useState<number | null>(null)

  const mermaidBlocks = !isUser ? extractMermaidBlocks(msg.content) : []

  const handleInject = async (code: string, idx: number) => {
    if (!excalidrawAPI) return
    setInjecting(idx)
    try {
      await injectMermaidToCanvas(code, excalidrawAPI)
    } catch (err) {
      console.error('Failed to inject mermaid:', err)
    } finally {
      setInjecting(null)
    }
  }

  const time = msg.timestamp.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <img
          src="/avatar.png"
          alt="Assistant"
          className="shrink-0 w-6 h-6 rounded-full object-cover border border-violet-400/20"
        />
      )}

      <div
        className={`group max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed
          ${isUser
            ? 'rounded-br-sm bg-white/[0.1] text-white'
            : msg.error
              ? 'rounded-bl-sm bg-red-500/10 border border-red-500/20 text-red-300'
              : 'rounded-bl-sm bg-white/[0.05] border border-white/[0.06] text-white/90'
          }`}
      >
        {msg.error && (
          <div className="flex items-center gap-1.5 mb-1 text-red-400/80">
            <AlertCircle size={10} />
            <span className="text-[9px] font-medium uppercase tracking-wider">Error</span>
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-[13px]">{msg.content}</p>
        ) : (
          <MarkdownMessage content={msg.content} />
        )}

        {/* Inject-to-canvas buttons for mermaid blocks */}
        {mermaidBlocks.length > 0 && excalidrawAPI && (
          <div className="mt-2 flex flex-col gap-1.5">
            {mermaidBlocks.map((code, idx) => (
              <button
                key={idx}
                onClick={() => handleInject(code, idx)}
                disabled={injecting !== null}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-medium
                  bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-colors
                  disabled:opacity-50 disabled:cursor-wait"
              >
                {injecting === idx ? (
                  <span className="animate-pulse">Agregando...</span>
                ) : (
                  <>Agregar al canvas</>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center mt-1 gap-1 ${isUser ? 'justify-end' : 'justify-between'}`}>
          {!isUser && (
            <div className="flex items-center gap-0.5">
              <AudioButton text={msg.content} messageId={msg.id} />
              <CopyBtn text={msg.content} />
            </div>
          )}
          <p className={`text-[9px] ${isUser ? 'text-white/30' : 'text-white/25'}`}>{time}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <img src="/avatar.png" alt="Assistant" className="shrink-0 w-6 h-6 rounded-full object-cover border border-violet-400/20" />
      <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.06] px-3 py-2.5">
        <div className="flex gap-1 items-center h-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main DrawChatPanel ──────────────────────────────────────────────────────

export function DrawChatPanel({ excalidrawAPI, onClose }: DrawChatPanelProps) {
  const history = useChatHistory()
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const hasAutoLoaded = useRef(false)

  const handleSave = useCallback(
    async (userMsg: string, assistantMsg: string, audioUrl?: string) => {
      const session = activeSession ?? (await history.createSession(userMsg))
      if (!activeSession) setActiveSession(session)
      await history.saveMessages(session.id, [
        { role: 'user', content: userMsg, audioUrl },
        { role: 'assistant', content: assistantMsg },
      ])
    },
    [activeSession, history],
  )

  const { messages, loading, sendMessage, loadMessages, clearMessages } = useChat({
    sessionId: activeSession?.id,
    onSave: handleSave,
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 100)}px`
  }, [input])

  // Auto-load most recent session
  useEffect(() => {
    if (hasAutoLoaded.current || history.loading || history.sessions.length === 0) return
    hasAutoLoaded.current = true
    const mostRecent = history.sessions.reduce((a, b) =>
      a.updated_at > b.updated_at ? a : b,
    )
    setActiveSession(mostRecent)
    setLoadingSession(true)
    history.loadMessages(mostRecent.id).then((persisted) => {
      loadMessages(persisted)
      setLoadingSession(false)
    })
  }, [history.loading, history.sessions, history, loadMessages])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || loading) return
    if (msg === '/clear') {
      setActiveSession(null)
      clearMessages()
      setInput('')
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'newchat' }),
      }).catch(() => {})
      return
    }
    sendMessage(msg)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AudioProvider>
      <div className="flex flex-col h-full bg-[#0a0a0f] border-l border-white/[0.06]">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img src="/avatar.png" alt="Assistant" className="w-6 h-6 rounded-full object-cover border border-violet-400/30" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0a0f]" />
            </div>
            <span className="text-xs font-semibold text-white">Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="Cerrar chat"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-2.5">
          {loadingSession ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-8 rounded-2xl bg-white/[0.04] animate-pulse ${i % 2 === 0 ? 'ml-auto w-2/3' : 'w-3/4'}`}
                />
              ))}
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <img src="/avatar.png" alt="Assistant" className="w-10 h-10 rounded-2xl object-cover border border-violet-400/20" />
              <p className="text-xs text-white/40">Pídele un diagrama al asistente</p>
            </div>
          ) : (
            messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} excalidrawAPI={excalidrawAPI} />
            ))
          )}

          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-3 pt-2.5 pb-0 md:pb-3 border-t border-white/[0.06]">
          <div className="flex items-end gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-[18px] px-3 py-1.5
            focus-within:border-violet-500/25 focus-within:bg-white/[0.06] transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pide un diagrama..."
              rows={1}
              disabled={loading || loadingSession}
              className="flex-1 bg-transparent text-[13px] text-white/90 placeholder-white/20 resize-none outline-none min-h-[22px] max-h-[100px] leading-5 py-0 disabled:opacity-50"
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleSend()
              }}
              onClick={handleSend}
              disabled={!input.trim() || loading || loadingSession}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500
                active:scale-90 disabled:opacity-30 disabled:bg-white/[0.06] disabled:from-white/[0.06] disabled:to-white/[0.06]
                text-white shadow-lg shadow-violet-500/20"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </AudioProvider>
  )
}
