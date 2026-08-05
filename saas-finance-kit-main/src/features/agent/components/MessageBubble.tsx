import type { UIMessage } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
  message: UIMessage
}

// Extract text content from UIMessage (AI SDK v5 uses parts array)
function getMessageContent(message: UIMessage): string {
  // If content exists directly (legacy or manual messages)
  if ('content' in message && typeof message.content === 'string') {
    return message.content
  }

  // AI SDK v5: extract text from parts array
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  return ''
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const content = getMessageContent(message)

  // Don't render empty messages
  if (!content && message.role !== 'user') return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[80%] p-4 rounded-2xl
          ${isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-neu-bg shadow-neu rounded-bl-sm'
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-xs font-semibold text-gray-600">Profits OS</span>
          </div>
        )}
        <div
          className={`
            text-sm
            ${isUser ? 'text-white' : 'text-gray-700 prose prose-sm prose-gray max-w-none'}
          `}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              components={{
                ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                h3: ({ children }) => <h3 className="font-semibold text-gray-800 mt-3 mb-1">{children}</h3>,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}
