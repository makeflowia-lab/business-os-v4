import { ConversationFeed } from '@/features/conversations/components/ConversationFeed'

export default function ConversationsPage() {
  return (
    <div className="h-full p-4">
      <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <ConversationFeed />
      </div>
    </div>
  )
}
