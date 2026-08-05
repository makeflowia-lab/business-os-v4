'use client'
import { useState, useEffect, useRef, useCallback, memo, startTransition } from 'react'
import {
  X, Send, MessageSquare, Plus, ChevronDown, Square,
  Copy, Check, AlertCircle, ImageIcon, ArrowLeft,
  Star, Clock, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useChat, type ChatMessage } from '@/features/chat/hooks/useChat'
import { useChatHistory, type ChatSession } from '@/features/chat/hooks/useChatHistory'
import { MarkdownMessage } from '@/features/chat/components/MarkdownMessage'
import { AudioButton } from '@/features/chat/components/AudioButton'
import { VoiceInput } from '@/features/chat/components/VoiceInput'
import { ToolCallCards } from '@/features/chat/components/ToolCallCard'
import { UsageBadge } from '@/features/chat/components/UsageBadge'
import { CommandPalette, SLASH_COMMANDS } from '@/features/chat/components/CommandPalette'
import { AudioProvider } from '@/features/chat/contexts/AudioContext'

// --- Copy button (compact) --------------------------------------------------------

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
      title="Copy"
      className="p-0.5 rounded text-white/20 hover:text-white/50 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  )
}

// --- Typing indicator --------------------------------------------------------------

function TypingDots() {
  return (
    <div className="flex gap-2 items-end">
      <div className="shrink-0 w-6 h-6 rounded-full bg-purple-600/30 border border-violet-400/20 flex items-center justify-center">
        <MessageSquare size={10} className="text-purple-300" />
      </div>
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

// --- Message bubble (compact for popup) --------------------------------------------

const BubbleMessage = memo(function BubbleMessage({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'

  const time = msg.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <div className="shrink-0 w-6 h-6 rounded-full bg-purple-600/30 border border-violet-400/20 flex items-center justify-center">
          <MessageSquare size={10} className="text-purple-300" />
        </div>
      )}

      <div
        className={`group max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-normal
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

        {/* User image attachment */}
        {isUser && msg.imageUrl && (
          <div className="mb-1.5">
            {msg.imageUrl.split('\n').filter((u) => u.startsWith('http')).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Image ${i + 1}`}
                className="rounded-lg border border-white/[0.08] max-w-full max-h-32 object-contain"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Tool call cards */}
        {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
          <ToolCallCards tools={msg.toolCalls} />
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-[13px]">{msg.content}</p>
        ) : (
          <>
            {msg.content ? (
              <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                <MarkdownMessage content={msg.content} />
              </div>
            ) : msg.streaming ? (
              <span className="inline-block w-1.5 h-4 bg-violet-400/60 animate-pulse rounded-sm" />
            ) : null}
          </>
        )}

        {/* Footer */}
        <div className={`flex items-center mt-1 gap-1 ${isUser ? 'justify-end' : 'justify-between'}`}>
          {!isUser && (
            <div className="flex items-center gap-0.5">
              {!msg.streaming && msg.content && (
                <>
                  <AudioButton text={msg.content} messageId={msg.id} />
                  <CopyBtn text={msg.content} />
                </>
              )}
            </div>
          )}
          {isUser && <CopyBtn text={msg.content} />}
          <div className="flex items-center gap-1">
            {!isUser && msg.usage && <UsageBadge usage={msg.usage} />}
            <p className={`text-[9px] ${isUser ? 'text-white/30' : 'text-white/25'}`}>{time}</p>
          </div>
        </div>
      </div>
    </div>
  )
}, (prev, next) => {
  const p = prev.msg, n = next.msg
  return p.content === n.content
    && p.streaming === n.streaming
    && p.error === n.error
    && p.toolCalls === n.toolCalls
    && p.usage === n.usage
})

// --- Main ChatBubble ---------------------------------------------------------------

export function ChatBubble() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('mc_chatBubbleHidden') === 'true'
  })
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [pendingImages, setPendingImages] = useState<{ file: File; previewUrl: string }[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState<string | null>(null)
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0)
  const MAX_IMAGES = 5

  // Listen for toggle from Settings
  useEffect(() => {
    const handler = () => {
      const val = localStorage.getItem('mc_chatBubbleHidden') === 'true'
      setHidden(val)
      if (val) setOpen(false)
    }
    window.addEventListener('mc:chatBubbleToggle', handler)
    return () => window.removeEventListener('mc:chatBubbleToggle', handler)
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const {
    sessions,
    createSession,
    saveMessages,
    loadMessages: loadPersistedMessages,
    deleteSession,
    renameSession,
    toggleFavorite,
  } = useChatHistory()

  const handleSaveMessages = useCallback(
    async (userMsg: string, assistantMsg: string, audioUrl?: string, imageUrl?: string) => {
      if (!sessionId) return
      await saveMessages(sessionId, [
        { role: 'user', content: userMsg, audioUrl, imageUrl },
        { role: 'assistant', content: assistantMsg },
      ])
    },
    [sessionId, saveMessages],
  )

  const { messages, loading, sendMessage, loadMessages, clearMessages, detachStream, stopStreaming } = useChat({
    sessionId,
    onSave: handleSaveMessages,
  })

  // Persist last session to localStorage
  useEffect(() => {
    if (sessionId) localStorage.setItem('mc_lastChatSessionId', sessionId)
  }, [sessionId])

  // Restore last session when opening for the first time
  useEffect(() => {
    if (!open || initialized) return
    if (sessions.length > 0) {
      const lastId = localStorage.getItem('mc_lastChatSessionId')
      const target = (lastId && sessions.find((s) => s.id === lastId)) || sessions[0]
      setSessionId(target.id)
      loadPersistedMessages(target.id).then(loadMessages)
      setInitialized(true)
    }
  }, [open, sessions, initialized, loadPersistedMessages, loadMessages])

  // Smart auto-scroll
  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    isAtBottomRef.current = atBottom
    setShowScrollBtn(!atBottom)
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    isAtBottomRef.current = true
    setShowScrollBtn(false)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])


  // ESC to stop streaming (only when bubble is open)
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && loading) {
        e.preventDefault()
        stopStreaming()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, loading, stopStreaming])

  // --- Image handling ----------------------------------------------------------------

  const attachImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return
    setPendingImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev
      return [...prev, { file, previewUrl: URL.createObjectURL(file) }]
    })
    inputRef.current?.focus()
  }, [])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    e.target.value = ''
    for (const file of Array.from(files)) attachImage(file)
  }, [attachImage])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) attachImage(file)
        return
      }
    }
  }, [attachImage])

  const removePendingImage = useCallback((index: number) => {
    setPendingImages((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // --- Send --------------------------------------------------------------------------

  const handleSend = useCallback(async (text?: string) => {
    const msg = text ?? input
    if ((!msg.trim() && pendingImages.length === 0) || loading) return

    // Handle /clear locally
    if (msg.trim() === '/clear') {
      detachStream()
      clearMessages()
      setSessionId(null)
      setInput('')
      setPaletteQuery(null)
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'newchat' }),
      }).catch(() => {})
      return
    }

    let sid = sessionId
    if (!sid) {
      const session = await createSession(msg.trim() || 'Image')
      sid = session.id
      setSessionId(sid)
      setInitialized(true)
    }

    isAtBottomRef.current = true
    setShowScrollBtn(false)

    // Upload images
    let imageUrl: string | undefined
    if (pendingImages.length > 0) {
      setUploadingImage(true)
      const uploadedUrls: string[] = []
      const supabase = createClient()
      for (const img of pendingImages) {
        try {
          const ext = img.file.name.split('.').pop() ?? 'png'
          const fileName = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
          const { data, error } = await supabase.storage
            .from('generated-images')
            .upload(fileName, img.file, { contentType: img.file.type, upsert: false })
          if (error) throw error
          const { data: urlData } = supabase.storage.from('generated-images').getPublicUrl(data.path)
          uploadedUrls.push(urlData.publicUrl)
        } catch { /* skip */ }
      }
      pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      setPendingImages([])
      setUploadingImage(false)
      if (uploadedUrls.length > 0) imageUrl = uploadedUrls.join('\n')
    }

    const imgCount = pendingImages.length
    const defaultMsg = imgCount > 1 ? `Analyze these ${imgCount} images` : 'Analyze this image'

    // Auto-inject draw context when on a draw page
    const drawMatch = pathname.match(/^\/draw\/([a-f0-9-]+)$/)
    const drawContext = drawMatch
      ? `User is viewing draw page (page_id: ${drawMatch[1]}). For ANY diagram or drawing request, use LIVE INJECTION (Mode 2): GET /api/draw/${drawMatch[1]} for spatial awareness, then PATCH /api/draw/${drawMatch[1]} to inject elements in real-time. NEVER create new drawings. NEVER share links.`
      : undefined

    sendMessage(msg.trim() || defaultMsg, { imageUrl, chatSessionId: sid, context: drawContext })
    setInput('')
    setPaletteQuery(null)
    setPaletteSelectedIndex(0)
  }, [input, loading, sessionId, createSession, sendMessage, pendingImages, detachStream, clearMessages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Command palette navigation
    if (paletteQuery !== null) {
      const filtered = SLASH_COMMANDS.filter((c) =>
        c.name.slice(1).startsWith(paletteQuery.toLowerCase())
      )
      if (e.key === 'Escape') {
        setPaletteQuery(null)
        setPaletteSelectedIndex(0)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setPaletteSelectedIndex((i) => Math.max(0, i - 1))
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setPaletteSelectedIndex((i) => Math.min(filtered.length - 1, i + 1))
        return
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const cmd = filtered[paletteSelectedIndex] ?? filtered[0]
        if (cmd) handleCommandSelect(cmd.name)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = useCallback((val: string) => {
    setInput(val)
    const el = inputRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`
    }
    startTransition(() => {
      const match = val.match(/^\/([a-z]*)$/)
      if (match) {
        setPaletteQuery(match[1])
        setPaletteSelectedIndex(0)
      } else {
        setPaletteQuery(null)
        setPaletteSelectedIndex(0)
      }
    })
  }, [])

  const handleCommandSelect = (cmdName: string) => {
    setPaletteQuery(null)
    setPaletteSelectedIndex(0)
    setInput('')
    handleSend(cmdName)
  }

  // --- Session management ------------------------------------------------------------

  const switchSession = useCallback(async (session: ChatSession) => {
    if (session.id === sessionId) {
      setSessionsOpen(false)
      return
    }
    detachStream()
    clearMessages()
    setSessionId(session.id)
    const persisted = await loadPersistedMessages(session.id)
    loadMessages(persisted)
    setSessionsOpen(false)
  }, [sessionId, detachStream, clearMessages, loadPersistedMessages, loadMessages])

  const handleNewSession = useCallback(() => {
    detachStream()
    clearMessages()
    setSessionId(null)
    setSessionsOpen(false)
  }, [detachStream, clearMessages])

  const handleVoiceNote = useCallback(async (transcription: string, audioUrl: string) => {
    let sid = sessionId
    if (!sid) {
      const session = await createSession(transcription)
      sid = session.id
      setSessionId(sid)
      setInitialized(true)
    }
    isAtBottomRef.current = true
    setShowScrollBtn(false)
    const drawMatch = pathname.match(/^\/draw\/([a-f0-9-]+)$/)
    const drawCtx = drawMatch
      ? `User is viewing draw page (page_id: ${drawMatch[1]}). For ANY diagram or drawing request, use LIVE INJECTION (Mode 2): GET /api/draw/${drawMatch[1]} for spatial awareness, then PATCH /api/draw/${drawMatch[1]} to inject elements in real-time. NEVER create new drawings. NEVER share links.`
      : undefined
    sendMessage(`[Voice note]: ${transcription}`, { audioUrl, chatSessionId: sid, context: drawCtx })
  }, [sessionId, createSession, sendMessage, pathname])

  const activeSession = sessions.find((s) => s.id === sessionId)

  // Don't render on /chat page, on mobile, or when hidden via Settings
  if (pathname === '/chat' || hidden) return null

  return (
    <AudioProvider>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-purple-600/80 shadow-lg shadow-purple-500/25
            hidden md:flex items-center justify-center
            hover:scale-105 active:scale-95 transition-transform
            overflow-hidden border-2 border-violet-400/30 hover:border-violet-400/60"
        >
          <MessageSquare size={22} className="text-white" />
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50
          w-[380px] h-[520px]
          hidden md:flex flex-col
          bg-[#0e0e18] border border-white/[0.08] rounded-2xl
          shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-violet-400/30 flex items-center justify-center">
                  <MessageSquare size={14} className="text-purple-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0e0e18]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Assistant</p>
                <p className="text-[10px] text-white/30">AI Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewSession}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
                title="New conversation"
              >
                <Plus size={15} />
              </button>
              <button
                onClick={() => setSessionsOpen((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${sessionsOpen ? 'bg-white/[0.1] text-white/70' : 'hover:bg-white/[0.08] text-white/40 hover:text-white/60'}`}
                title="Conversations"
              >
                <MessageSquare size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Sessions panel (replaces messages area when open) */}
          {sessionsOpen ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Sessions header */}
              <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                <button
                  onClick={() => setSessionsOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                >
                  <ArrowLeft size={14} />
                </button>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                  Conversations
                </span>
                <button
                  onClick={() => { handleNewSession(); setSessionsOpen(false) }}
                  title="New conversation"
                  className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {/* Sessions list */}
              <div className="flex-1 min-h-0 overflow-y-auto py-1.5">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 px-3 py-8">
                    <MessageSquare size={20} className="text-white/15" />
                    <p className="text-[11px] text-white/25">No history</p>
                  </div>
                ) : (
                  sessions.map((s) => (
                    <BubbleSessionItem
                      key={s.id}
                      session={s}
                      active={s.id === sessionId}
                      onSelect={() => { switchSession(s); setSessionsOpen(false) }}
                      onDelete={() => {
                        deleteSession(s.id)
                        if (s.id === sessionId) {
                          detachStream()
                          clearMessages()
                          setSessionId(null)
                        }
                      }}
                      onToggleFavorite={() => toggleFavorite(s.id)}
                      onRename={(title) => renameSession(s.id, title)}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="relative flex-1 min-h-0">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-2.5"
                >
                  {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-violet-400/20 flex items-center justify-center">
                        <MessageSquare size={18} className="text-purple-300/60" />
                      </div>
                      <p className="text-xs text-white/20">Type something to start...</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <BubbleMessage key={msg.id} msg={msg} />
                  ))}
                  {loading && !messages.some((m) => m.streaming) && <TypingDots />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll-to-bottom button */}
                {showScrollBtn && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10
                      w-7 h-7 rounded-full flex items-center justify-center
                      bg-white/[0.1] border border-white/[0.12] text-white/50
                      hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-white/80
                      active:scale-90 transition-all duration-200 shadow-lg shadow-black/30"
                    title="Scroll to bottom"
                  >
                    <ChevronDown size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Input area (hidden when sessions panel is open) */}
          {!sessionsOpen && <div className="shrink-0 px-3 pb-3 pt-1 border-t border-white/[0.06]">
            <div className="relative">
              {paletteQuery !== null && (
                <CommandPalette
                  query={paletteQuery}
                  selectedIndex={paletteSelectedIndex}
                  onSelect={handleCommandSelect}
                  onClose={() => { setPaletteQuery(null); setPaletteSelectedIndex(0) }}
                />
              )}

              {/* Pending images preview */}
              {pendingImages.length > 0 && (
                <div className="mb-2 flex flex-wrap items-start gap-1.5">
                  {pendingImages.map((img, i) => (
                    <div key={i} className="relative inline-block">
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${i + 1}`}
                        className="h-12 w-12 rounded-lg border border-white/[0.1] object-cover"
                      />
                      <button
                        onClick={() => removePendingImage(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                  {pendingImages.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-12 w-12 rounded-lg border border-dashed border-white/[0.15] flex items-center justify-center text-white/25 hover:text-white/50 hover:border-white/30 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  {uploadingImage && (
                    <span className="text-[10px] text-violet-400 animate-pulse self-center">Uploading...</span>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-1.5
                focus-within:border-violet-500/25 focus-within:bg-white/[0.08] transition-all duration-300">
                {/* Image upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploadingImage}
                  title="Send image"
                  className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-white/25 hover:text-white/50 transition-colors disabled:opacity-30"
                >
                  <ImageIcon size={14} />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={pendingImages.length > 0 ? 'Add a message...' : '/ commands - Message...'}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none resize-none min-h-[24px] max-h-24 leading-6 py-0"
                />
                {loading ? (
                  <button
                    onClick={stopStreaming}
                    title="Stop (Esc)"
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                      bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500
                      active:scale-90 text-white shadow-lg shadow-red-500/20 animate-pulse"
                  >
                    <Square size={11} />
                  </button>
                ) : (input.trim() || pendingImages.length > 0) ? (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSend()}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                      bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500
                      active:scale-90 text-white shadow-lg shadow-violet-500/20"
                  >
                    <Send size={13} />
                  </button>
                ) : (
                  <VoiceInput
                    onVoiceNote={handleVoiceNote}
                    disabled={false}
                  />
                )}
              </div>
            </div>
          </div>}
        </div>
      )}
    </AudioProvider>
  )
}

// --- Session item for bubble panel ---------------------------------------------------

function BubbleSessionItem({
  session,
  active,
  onSelect,
  onDelete,
  onToggleFavorite,
  onRename,
}: {
  session: { id: string; title: string; is_favorite: boolean; updated_at: string }
  active: boolean
  onSelect: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onRename: (title: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(session.title)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isProtected = session.title === 'Automations'

  const timeAgo = formatDistanceToNow(new Date(session.updated_at), {
    addSuffix: false,
  })

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    if (editing) {
      setEditValue(session.title)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, session.title])

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== session.title) onRename(trimmed)
    setEditing(false)
  }

  return (
    <div
      className={`group relative mx-1.5 rounded-lg transition-all
        ${active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}
    >
      <div
        onClick={() => !editing && onSelect()}
        className="flex flex-col gap-0.5 px-2.5 py-2 cursor-pointer pr-8"
      >
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white/[0.06] border border-violet-500/40 rounded px-1.5 py-0.5 text-xs text-white outline-none"
          />
        ) : (
          <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
            {session.title}
          </p>
        )}

        {!editing && (
          <div className="flex items-center gap-1 text-[10px] text-white/25">
            {isProtected ? (
              <Clock size={9} className="text-emerald-400/80 shrink-0" />
            ) : session.is_favorite ? (
              <Star size={9} className="text-amber-400/70 fill-amber-400/70 shrink-0" />
            ) : (
              <Clock size={9} className="shrink-0" />
            )}
            <span className="truncate">{timeAgo}</span>
          </div>
        )}
      </div>

      {!editing && (
        <div className="absolute top-2 right-1.5" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className={`p-1 rounded transition-colors
              ${menuOpen
                ? 'bg-white/[0.1] text-white/60'
                : 'text-white/0 group-hover:text-white/30 hover:!text-white/60 hover:bg-white/[0.08]'
              }`}
          >
            <MoreHorizontal size={12} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-white/[0.08] bg-[#111118] shadow-xl shadow-black/40 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onToggleFavorite() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Star size={12} className={session.is_favorite ? 'text-amber-400 fill-amber-400' : ''} />
                {session.is_favorite ? 'Remove favorite' : 'Favorite'}
              </button>
              {!isProtected && (
                <button
                  onClick={() => { setMenuOpen(false); setEditing(true) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Pencil size={12} />
                  Rename
                </button>
              )}
              {!isProtected && (
                <>
                  <div className="h-px bg-white/[0.06]" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
