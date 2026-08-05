'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Search, PanelLeft, MessageSquare, Plus } from 'lucide-react'
import { AvatarLightbox } from '@/shared/components/AvatarLightbox'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { useSearchStore } from '@/features/search/components'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

export function Header() {
  const { toggleLeftSidebar, toggleChatSessionsPanel } = useLayoutStore()
  const pathname = usePathname()
  const isChatPage = pathname === '/chat'
  const [avatarOpen, setAvatarOpen] = useState(false)

  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent('openclaw:new-chat'))
  }

  return (
    <header className="h-14 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-4 relative z-10">
      {/* Specular rim */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Left: Sidebar toggle + sessions toggle on mobile chat */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLeftSidebar}
          className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
        >
          <PanelLeft size={18} />
        </button>

        {/* Mobile chat: sessions toggle */}
        {isChatPage && (
          <button
            onClick={toggleChatSessionsPanel}
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
            title="Conversations"
          >
            <MessageSquare size={18} />
          </button>
        )}
      </div>

      {/* Center: Assistant info on mobile chat, MISSION CONTROL badge elsewhere */}
      <div className="flex items-center gap-2">
        {isChatPage ? (
          <>
            {/* Mobile: Assistant avatar + name */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setAvatarOpen(true)} className="relative rounded-full focus:outline-none" title="View profile">
                <img src="/avatar.png" alt="Assistant" className="w-7 h-7 rounded-full object-cover border border-violet-400/30 hover:border-violet-400/70 transition-colors" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0a0f]" />
              </button>
              <div className="select-none pointer-events-none">
                <p className="text-sm font-semibold text-white leading-none">Assistant</p>
                <p className="text-[10px] text-white/40 mt-0.5">Agent</p>
              </div>
            </div>
            {avatarOpen && <AvatarLightbox src="/avatar.png" alt="Assistant" onClose={() => setAvatarOpen(false)} />}
            {/* Desktop: MISSION CONTROL badge */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
                <span className="text-[10px] font-bold tracking-tighter text-white/90">MISSION CONTROL</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <span className="text-[10px] font-bold tracking-tighter text-white/90">MISSION CONTROL</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: new chat (mobile chat only) + search + notifications */}
      <div className="flex items-center gap-1">
        {isChatPage && (
          <button
            onClick={handleNewChat}
            title="New conversation"
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
          >
            <Plus size={18} />
          </button>
        )}
        <button
          onClick={() => useSearchStore.getState().toggle()}
          className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80"
        >
          <Search size={18} />
        </button>
        <NotificationBell />
      </div>
    </header>
  )
}
