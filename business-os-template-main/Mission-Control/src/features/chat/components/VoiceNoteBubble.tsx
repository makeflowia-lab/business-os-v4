import { WaveformPlayer } from './WaveformPlayer'

interface VoiceNoteBubbleProps {
  audioUrl: string
  messageId: string
  isUser?: boolean
}

// Thin wrapper kept for backward compatibility
export function VoiceNoteBubble({ audioUrl, messageId, isUser }: VoiceNoteBubbleProps) {
  return <WaveformPlayer audioUrl={audioUrl} messageId={messageId} isUser={isUser} />
}
