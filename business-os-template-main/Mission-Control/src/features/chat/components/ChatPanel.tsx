'use client'
import { useEffect, useRef, useState, KeyboardEvent, useCallback, memo, startTransition, useMemo } from 'react'
import { Plus, Send, Square, AlertCircle, MessageSquare, Copy, Check, Clock, ChevronDown, ImageIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { AvatarLightbox } from '@/shared/components/AvatarLightbox'
import { useChat, ChatMessage, ToolCall } from '../hooks/useChat'
import { useChatHistory, ChatSession } from '../hooks/useChatHistory'
import { ChatSessions } from './ChatSessions'
import { MarkdownMessage, ImageLightbox } from './MarkdownMessage'
import { AudioButton } from './AudioButton'
import { VoiceInput } from './VoiceInput'
import { WaveformPlayer } from './WaveformPlayer'
import { GlobalAudioBar } from './GlobalAudioBar'
import { CommandPalette, SLASH_COMMANDS } from './CommandPalette'
import { ModelPicker } from './ModelPicker'
import { CompactSeparator } from './CompactSeparator'
import { DateSeparator } from './DateSeparator'
import { ToolCallCards } from './ToolCallCard'
import { UsageBadge } from './UsageBadge'
import { AudioProvider } from '../contexts/AudioContext'

// ─── Copy button ──────────────────────────────────────────────────────────────

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
      title="Copy message"
      className="flex items-center justify-center min-w-[36px] min-h-[36px] md:min-w-0 md:min-h-0 p-2 md:p-0.5 rounded-lg md:rounded text-white/20 hover:text-white/50 hover:bg-white/[0.06] md:hover:bg-transparent transition-colors"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  )
}

// ─── User image attachment (reuses lightbox from MarkdownMessage) ─────────────

function UserImageAttachment({ src }: { src: string }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  // Support multiple URLs separated by newline
  const urls = src.split('\n').filter((u) => u.startsWith('http'))

  return (
    <>
      <div className={`mb-1.5 ${urls.length > 1 ? 'flex flex-wrap gap-1.5' : ''}`}>
        {urls.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightboxUrl(url)}
            className={`block group/img relative rounded-lg overflow-hidden cursor-pointer focus:outline-none ${
              urls.length > 1 ? 'w-[calc(50%-3px)]' : ''
            }`}
          >
            <img
              src={url}
              alt={`Image ${i + 1}`}
              className={`rounded-lg border border-white/[0.08] object-cover transition-transform duration-200 group-hover/img:scale-[1.02] ${
                urls.length > 1 ? 'w-full h-24' : 'max-w-full max-h-48 object-contain'
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover/img:opacity-100 transition-opacity text-white/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
              </span>
            </div>
          </button>
        ))}
      </div>
      {lightboxUrl && <ImageLightbox src={lightboxUrl} alt="Attached image" onClose={() => setLightboxUrl(null)} />}
    </>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const isVoiceNote = !!msg.audioUrl
  const [avatarOpen, setAvatarOpen] = useState(false)

  // Detect slash commands
  const cmdMatch = isUser ? SLASH_COMMANDS.find((c) => msg.content.trim().startsWith(c.name)) : null
  const isCommand = !!cmdMatch

  const time = msg.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Strip "[Voice note]: " prefix for display
  const transcription = isVoiceNote
    ? msg.content.replace(/^\[Voice note\]:\s*/i, '').replace(/^\[Nota de voz\]:\s*/i, '').trim()
    : null

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {!isUser && (
        <>
          <button
            onClick={() => setAvatarOpen(true)}
            className="shrink-0 mb-1 rounded-full focus:outline-none"
            title="View Assistant profile"
          >
            <img src="/icon.svg" alt="Assistant" className="w-7 h-7 rounded-full object-cover border border-violet-400/20 hover:border-violet-400/60 transition-colors" />
          </button>
          {avatarOpen && <AvatarLightbox src="/icon.svg" alt="Assistant" onClose={() => setAvatarOpen(false)} />}
        </>
      )}

      <div
        className={`group max-w-[75%] min-w-0 overflow-hidden rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
          ${isUser
            ? isCommand
              ? 'rounded-br-sm bg-violet-500/15 border border-violet-500/25 text-violet-200'
              : 'rounded-br-sm bg-white/[0.1] text-white'
            : msg.error
              ? 'rounded-bl-sm bg-red-500/10 border border-red-500/20 text-red-300'
              : 'rounded-bl-sm bg-white/[0.05] border border-white/[0.06] text-white/90'
          }`}
      >
        {msg.error && (
          <div className="flex items-center gap-1.5 mb-1 text-red-400/80">
            <AlertCircle size={12} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Error</span>
          </div>
        )}

        {msg.metadata?.source === 'cron' && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-[10px] font-medium text-violet-300">
              <Clock size={10} />
              {msg.metadata.jobLabel ?? msg.metadata.jobId ?? 'Cron'}
            </span>
          </div>
        )}

        {/* Tool call cards (shown above response text) */}
        {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
          <ToolCallCards tools={msg.toolCalls} />
        )}

        {/* User image attachment */}
        {isUser && msg.imageUrl && <UserImageAttachment src={msg.imageUrl} />}

        {/* User voice note */}
        {isVoiceNote && msg.audioUrl ? (
          <>
            <WaveformPlayer audioUrl={msg.audioUrl} messageId={msg.id} isUser={isUser} />
            {transcription && (
              <p className="text-[11px] text-white/40 mt-1.5 italic leading-relaxed">
                {transcription}
              </p>
            )}
          </>
        ) : isUser && isCommand && cmdMatch ? (
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cmdMatch.iconClass}`}>
              <cmdMatch.icon size={13} strokeWidth={1.75} />
            </div>
            <span className="font-mono font-semibold text-[13px] text-violet-200">{cmdMatch.name}</span>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        ) : (
          <>
            {msg.content ? (
              <MarkdownMessage content={msg.content} />
            ) : msg.streaming ? (
              <span className="inline-block w-2 h-4 bg-violet-400/60 animate-pulse rounded-sm" />
            ) : null}
          </>
        )}

        {/* Footer: actions + timestamp + usage */}
        <div className={`flex items-center mt-1.5 gap-1.5 ${isUser ? 'justify-end' : 'justify-between'}`}>
          {!isUser && (
            <div className="flex items-center gap-1">
              {!msg.streaming && msg.content && (
                <>
                  <AudioButton text={msg.content} messageId={msg.id} />
                  <CopyBtn text={msg.content} />
                </>
              )}
            </div>
          )}
          {isUser && <CopyBtn text={msg.content} />}
          <div className="flex items-center gap-1.5">
            {!isUser && msg.usage && <UsageBadge usage={msg.usage} />}
            <p className={`text-[10px] ${isUser ? 'text-white/30' : 'text-white/25'}`}>
              {time}
            </p>
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
    && p.compact === n.compact
})

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <img src="/icon.svg" alt="Assistant" className="shrink-0 w-7 h-7 rounded-full object-cover border border-violet-400/20" />
      <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.06] px-4 py-3">
        <div className="flex gap-1 items-center h-4">
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

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ChatPanel() {
  const { chatSessionsPanelOpen, toggleChatSessionsPanel, closeChatSessionsPanel } = useLayoutStore()
  const history = useChatHistory()
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)

  // Slash commands
  const [paletteQuery, setPaletteQuery] = useState<string | null>(null)
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0)
  const [showModelPicker, setShowModelPicker] = useState(false)

  const handleSave = useCallback(
    async (userMsg: string, assistantMsg: string, audioUrl?: string, imageUrl?: string) => {
      const session = activeSession ?? (await history.createSession(userMsg))
      if (!activeSession) setActiveSession(session)
      await history.saveMessages(session.id, [
        { role: 'user', content: userMsg, audioUrl, imageUrl },
        { role: 'assistant', content: assistantMsg },
      ])
    },
    [activeSession, history],
  )

  const { messages, loading, sendMessage, loadMessages, clearMessages, appendMessage, stopStreaming, detachStream, currentModel } = useChat({
    sessionId: activeSession?.id,
    onSave: handleSave,
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const hasAutoLoaded = useRef(false)
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [pendingImages, setPendingImages] = useState<{ file: File; previewUrl: string }[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const MAX_IMAGES = 10

  // Auto-scroll only when user is at the bottom (smart scroll)
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // Track whether user is near the bottom
  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    isAtBottomRef.current = atBottom
    setShowScrollBtn(!atBottom)
  }, [])

  // Jump to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    isAtBottomRef.current = true
    setShowScrollBtn(false)
  }, [])

  // When the container resizes (keyboard open/close), scroll to bottom if we were there.
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      if (isAtBottomRef.current) el.scrollTop = el.scrollHeight
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSelectSession = useCallback(
    async (session: ChatSession) => {
      // If streaming in another session, detach it (let it continue in background)
      detachStream()
      setActiveSession(session)
      localStorage.setItem('mc_lastChatSessionId', session.id)
      setLoadingSession(true)
      try {
        const persisted = await history.loadMessages(session.id)
        loadMessages(persisted)
      } finally {
        setLoadingSession(false)
      }
    },
    [history, loadMessages, detachStream],
  )

  // Auto-load last viewed session (or most recent) on first mount
  useEffect(() => {
    if (hasAutoLoaded.current || history.loading || history.sessions.length === 0) return
    hasAutoLoaded.current = true
    const lastId = localStorage.getItem('mc_lastChatSessionId')
    const target = (lastId && history.sessions.find((s) => s.id === lastId))
      || history.sessions.reduce((a, b) => a.updated_at > b.updated_at ? a : b)
    handleSelectSession(target)
  }, [history.loading, history.sessions, handleSelectSession])

  const handleNewChat = useCallback(async () => {
    // If streaming, detach it (let it continue in background)
    detachStream()
    setActiveSession(null)
    clearMessages()
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'newchat' }),
      })
    } catch { /* ignore */ }
  }, [clearMessages, detachStream])

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await history.deleteSession(sessionId)
      if (activeSession?.id === sessionId) {
        setActiveSession(null)
        clearMessages()
      }
    },
    [history, activeSession, clearMessages],
  )

  const handleToggleFavorite = useCallback(
    (sessionId: string) => history.toggleFavorite(sessionId),
    [history],
  )

  const handleRename = useCallback(
    (sessionId: string, title: string) => history.renameSession(sessionId, title),
    [history],
  )

  const attachImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) return // 10MB max
    setPendingImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev
      const previewUrl = URL.createObjectURL(file)
      return [...prev, { file, previewUrl }]
    })
    textareaRef.current?.focus()
  }, [])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    e.target.value = ''
    for (const file of Array.from(files)) {
      attachImage(file)
    }
  }, [attachImage])

  // Paste images from clipboard (Cmd+V / Ctrl+V / mobile paste)
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

  const clearAllPendingImages = useCallback(() => {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      return []
    })
  }, [])

  const handleSend = async (text?: string) => {
    const msg = text ?? input
    if ((!msg.trim() && pendingImages.length === 0) || loading) return
    // /clear is handled locally
    if (msg.trim() === '/clear') {
      handleNewChat()
      setInput('')
      setPaletteQuery(null)
      setPaletteSelectedIndex(0)
      return
    }
    // /model without args opens the picker
    if (msg.trim() === '/model') {
      setShowModelPicker(true)
      setInput('')
      setPaletteQuery(null)
      setPaletteSelectedIndex(0)
      return
    }
    isAtBottomRef.current = true
    setShowScrollBtn(false)

    // Upload all pending images to Supabase Storage
    let imageUrl: string | undefined
    if (pendingImages.length > 0) {
      setUploadingImage(true)
      const uploadedUrls: string[] = []
      try {
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
          } catch {
            // Skip failed uploads
          }
        }
        // First URL is the "primary" image (sent to Agent Server for vision analysis)
        // All URLs stored joined by newline in image_url field
        if (uploadedUrls.length > 0) {
          imageUrl = uploadedUrls.join('\n')
        }
      } finally {
        pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
        setPendingImages([])
        setUploadingImage(false)
      }
    }

    const defaultMsg = pendingImages.length > 1 ? `Analyze these ${pendingImages.length} images` : 'Analyze this image'
    sendMessage(msg.trim() || defaultMsg, { imageUrl, chatSessionId: activeSession?.id })
    setInput('')
    setPaletteQuery(null)
    setPaletteSelectedIndex(0)
    setShowModelPicker(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
    const isMobile = window.innerWidth < 768
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = useCallback((val: string) => {
    setInput(val)
    // Auto-resize inline
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
    // Palette updates are non-critical UI
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
    if (cmdName === '/model') {
      setShowModelPicker(true)
      setPaletteQuery(null)
      setPaletteSelectedIndex(0)
      setInput('')
      return
    }
    // Send command immediately on click
    setPaletteQuery(null)
    setPaletteSelectedIndex(0)
    setInput('')
    handleSend(cmdName)
  }

  const handleModelSelect = (modelValue: string) => {
    setShowModelPicker(false)
    sendMessage(`/model ${modelValue}`, { chatSessionId: activeSession?.id })
  }

  const handleVoiceNote = useCallback((transcription: string, audioUrl: string) => {
    isAtBottomRef.current = true
    setShowScrollBtn(false)
    sendMessage(`[Voice note]: ${transcription}`, { audioUrl, chatSessionId: activeSession?.id })
  }, [sendMessage])

  // ESC to stop streaming
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && loading) {
        e.preventDefault()
        stopStreaming()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [loading, stopStreaming])

  // Listen for new-chat event from mobile Header
  useEffect(() => {
    const handler = () => handleNewChat()
    window.addEventListener('openclaw:new-chat', handler)
    return () => window.removeEventListener('openclaw:new-chat', handler)
  }, [handleNewChat])

  // Realtime subscription: listen for new chat_messages on the active session
  useEffect(() => {
    if (!activeSession?.id) return
    const supabase = createClient()
    const channel = supabase
      .channel(`chat_messages:${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${activeSession.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string
            role: 'user' | 'assistant'
            content: string
            created_at: string
            audio_url?: string | null
            image_url?: string | null
            metadata?: { source?: string; jobId?: string; jobLabel?: string } | null
          }
          appendMessage({
            id: row.id,
            role: row.role,
            content: row.content,
            timestamp: new Date(row.created_at),
            audioUrl: row.audio_url ?? undefined,
            imageUrl: row.image_url ?? undefined,
            metadata: row.metadata ?? undefined,
          })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeSession?.id, appendMessage])

  // Memoize message list
  const messagesList = useMemo(() => {
    const items: React.ReactNode[] = []
    let prevDate: string | null = null

    for (const msg of messages) {
      const msgDate = msg.timestamp.toDateString()
      if (msgDate !== prevDate) {
        items.push(<DateSeparator key={`date-${msgDate}`} date={msg.timestamp} />)
        prevDate = msgDate
      }
      items.push(
        <div key={msg.id}>
          {msg.compact && (
            <CompactSeparator
              tokensBefore={msg.compact.tokensBefore}
              tokensAfter={msg.compact.tokensAfter}
            />
          )}
          <MessageBubble msg={msg} />
        </div>
      )
    }
    return items
  }, [messages])

  return (
    <AudioProvider>
    <div className="flex h-full relative">
      {/* Mobile overlay backdrop */}
      {chatSessionsPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={closeChatSessionsPanel}
        />
      )}

      {/* Sessions sidebar */}
      <div className={`
        ${chatSessionsPanelOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${chatSessionsPanelOpen ? 'md:w-64' : 'md:w-0 md:overflow-hidden'}
        fixed md:relative z-20 md:z-0
        w-64 h-full
        bg-[#0a0a0f] md:bg-transparent
        transition-all duration-300 ease-in-out
      `}>
        <ChatSessions
          sessions={history.sessions}
          loading={history.loading}
          activeId={activeSession?.id ?? null}
          onSelect={(session) => { handleSelectSession(session); closeChatSessionsPanel() }}
          onNew={() => { handleNewChat(); closeChatSessionsPanel() }}
          onDelete={handleDeleteSession}
          onToggleFavorite={handleToggleFavorite}
          onRename={handleRename}
        />
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header -- desktop only */}
        <div className="shrink-0 relative hidden md:flex items-center px-4 py-3 border-b border-white/[0.06] z-10">
          {/* Left zone: toggle */}
          <button
            onClick={toggleChatSessionsPanel}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
            title="Conversations"
          >
            <MessageSquare size={14} />
          </button>

          {/* Center zone: Assistant avatar + name */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 pointer-events-none select-none">
            <div className="relative">
              <img src="/icon.svg" alt="Assistant" className="w-8 h-8 rounded-full object-cover border border-violet-400/30" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0a0a0f]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Assistant</p>
              <p className="text-[10px] text-white/40">
                {currentModel
                  ? currentModel.replace('claude-', '').split('-').slice(0, 2).join(' ')
                  : activeSession ? activeSession.title.slice(0, 30) + (activeSession.title.length > 30 ? '...' : '') : 'Agent Server'}
              </p>
            </div>
          </div>

          {/* Right zone: new chat */}
          <button
            onClick={handleNewChat}
            title="New conversation"
            className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Global audio bar */}
        <GlobalAudioBar />

        {/* Messages */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3"
          >
            {loadingSession ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-10 rounded-2xl bg-white/[0.04] animate-pulse ${i % 2 === 0 ? 'ml-auto w-2/3' : 'w-3/4'}`}
                  />
                ))}
              </div>
            ) : messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <img src="/icon.svg" alt="Assistant" className="w-12 h-12 rounded-2xl object-cover border border-violet-400/20" />
                <div>
                  <p className="text-sm font-medium text-white/50">Hello</p>
                  <p className="text-xs text-white/25 mt-1">Send a message to get started</p>
                </div>
              </div>
            ) : (
              messagesList
            )}

            <div ref={bottomRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10
                w-8 h-8 rounded-full flex items-center justify-center
                bg-white/[0.1] border border-white/[0.12] text-white/50
                hover:bg-violet-500/20 hover:border-violet-500/30 hover:text-white/80
                active:scale-90 transition-all duration-200 shadow-lg shadow-black/30"
              title="Scroll to bottom"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Input toolbar */}
        <div className="shrink-0 bg-white/[0.02] backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-4 pt-2.5 pb-0 md:pb-3">
            <div className="relative">
              {paletteQuery !== null && (
                <CommandPalette
                  query={paletteQuery}
                  selectedIndex={paletteSelectedIndex}
                  onSelect={handleCommandSelect}
                  onClose={() => { setPaletteQuery(null); setPaletteSelectedIndex(0) }}
                />
              )}
              {showModelPicker && (
                <ModelPicker
                  onSelect={handleModelSelect}
                  onClose={() => setShowModelPicker(false)}
                />
              )}

              {/* Pending images preview */}
              {pendingImages.length > 0 && (
                <div className="mb-2 flex flex-wrap items-start gap-2">
                  {pendingImages.map((img, i) => (
                    <div key={i} className="relative inline-block">
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${i + 1}`}
                        className="h-16 w-16 rounded-xl border border-white/[0.1] object-cover"
                      />
                      <button
                        onClick={() => removePendingImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {pendingImages.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-16 w-16 rounded-xl border border-dashed border-white/[0.15] flex items-center justify-center text-white/25 hover:text-white/50 hover:border-white/30 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                  {uploadingImage && (
                    <span className="text-[10px] text-violet-400 animate-pulse self-center">Uploading...</span>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-[22px] px-4 py-2
                focus-within:border-violet-500/25 focus-within:bg-white/[0.06]
                transition-all duration-300">
                {/* Image upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || loadingSession || uploadingImage}
                  title="Send image"
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-colors disabled:opacity-30"
                >
                  <ImageIcon size={16} />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={pendingImages.length > 0 ? 'Add a message or send...' : 'Message...'}
                  rows={1}
                  disabled={loadingSession}
                  className="flex-1 bg-transparent text-[15px] md:text-sm text-white/90 placeholder-white/20 resize-none outline-none min-h-[28px] max-h-[120px] leading-snug py-1 disabled:opacity-50"
                />
                {loading ? (
                  <button
                    onClick={stopStreaming}
                    title="Stop (Esc)"
                    className="shrink-0 w-9 h-9 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200
                      bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500
                      active:scale-90 text-white shadow-lg shadow-red-500/20 animate-pulse"
                  >
                    <Square size={13} className="md:w-[11px] md:h-[11px]" />
                  </button>
                ) : (input.trim() || pendingImages.length > 0) ? (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    onClick={() => handleSend()}
                    disabled={loadingSession}
                    className="shrink-0 w-9 h-9 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200
                      bg-gradient-to-br from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500
                      active:scale-90 disabled:opacity-40 text-white shadow-lg shadow-violet-500/20"
                  >
                    <Send size={15} className="md:w-[13px] md:h-[13px] translate-x-[0.5px]" />
                  </button>
                ) : (
                  <VoiceInput
                    onVoiceNote={handleVoiceNote}
                    disabled={loadingSession}
                  />
                )}
              </div>
            </div>
            <p className="hidden md:block text-[9px] text-white/15 text-center mt-1.5 tracking-wide">
              Enter send · Shift+Enter new line · Esc stop · / commands
            </p>
          </div>
          <div className="safe-area-spacer shrink-0" />
        </div>
      </div>
    </div>
    </AudioProvider>
  )
}
