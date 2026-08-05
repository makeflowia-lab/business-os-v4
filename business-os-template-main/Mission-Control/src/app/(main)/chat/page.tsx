import { ChatPanel } from '@/features/chat/components/ChatPanel'

export default function ChatPage() {
  return (
    <div className="h-full p-0 md:p-4">
      <div className="h-full md:rounded-2xl md:border md:border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <ChatPanel />
      </div>
    </div>
  )
}
