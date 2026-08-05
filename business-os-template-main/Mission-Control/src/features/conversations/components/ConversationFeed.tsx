'use client'
import { useConversations } from '../hooks/useConversations'
import { ConversationItem } from './ConversationItem'

export function ConversationFeed() {
  const { conversations, loading } = useConversations()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white/80">Conversations</h2>
          {conversations.length > 0 && (
            <span className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded-full text-white/40">
              {conversations.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/30">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="space-y-px p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-white/30">Send a message to the assistant to see it here</p>
          </div>
        ) : (
          conversations.map((c) => <ConversationItem key={c.id} conversation={c} />)
        )}
      </div>
    </div>
  )
}
