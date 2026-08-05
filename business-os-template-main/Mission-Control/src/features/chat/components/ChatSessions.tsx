'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Plus, Clock, MoreHorizontal, Star, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ChatSession } from '../hooks/useChatHistory'

interface ChatSessionsProps {
  sessions: ChatSession[]
  loading: boolean
  activeId: string | null
  onSelect: (session: ChatSession) => void
  onNew: () => void
  onDelete: (sessionId: string) => void
  onToggleFavorite: (sessionId: string) => void
  onRename: (sessionId: string, title: string) => void
}

export function ChatSessions({
  sessions,
  loading,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onToggleFavorite,
  onRename,
}: ChatSessionsProps) {
  return (
    <div className="flex flex-col h-full border-r border-white/[0.06]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Conversations
        </span>
        <button
          onClick={onNew}
          title="New conversation"
          className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1.5">
        {loading ? (
          <div className="space-y-1.5 px-2 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-3 py-8 text-center">
            <MessageSquare size={20} className="text-white/15" />
            <p className="text-[11px] text-white/25">No history</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              active={activeId === session.id}
              onSelect={() => onSelect(session)}
              onDelete={() => onDelete(session.id)}
              onToggleFavorite={() => onToggleFavorite(session.id)}
              onRename={(title) => onRename(session.id, title)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Session item ──────────────────────────────────────────────────────────────

function SessionItem({
  session,
  active,
  onSelect,
  onDelete,
  onToggleFavorite,
  onRename,
}: {
  session: ChatSession
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

  const timeAgo = formatDistanceToNow(new Date(session.updated_at), {
    addSuffix: false,
  })

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Focus input when editing starts
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

  const isProtected = session.title === 'Automations'

  const handleMenuAction = (action: 'favorite' | 'rename' | 'delete') => {
    setMenuOpen(false)
    if (action === 'favorite') onToggleFavorite()
    if (action === 'rename' && !isProtected) setEditing(true)
    if (action === 'delete' && !isProtected) onDelete()
  }

  return (
    <div
      className={`group relative mx-1.5 rounded-lg transition-all
        ${active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}
    >
      {/* Clickable area */}
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

      {/* Three-dot button */}
      {!editing && (
        <div className="absolute top-2 right-1.5" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className={`
              p-1 rounded transition-colors
              ${menuOpen
                ? 'bg-white/[0.1] text-white/60'
                : 'text-white/0 group-hover:text-white/30 hover:!text-white/60 hover:bg-white/[0.08]'
              }
            `}
            title="Options"
          >
            <MoreHorizontal size={12} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-white/[0.08] bg-[#111118] shadow-xl shadow-black/40 overflow-hidden">
              <button
                onClick={() => handleMenuAction('favorite')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Star size={12} className={session.is_favorite ? 'text-amber-400 fill-amber-400' : ''} />
                {session.is_favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              {!isProtected && (
                <button
                  onClick={() => handleMenuAction('rename')}
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
                    onClick={() => handleMenuAction('delete')}
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
