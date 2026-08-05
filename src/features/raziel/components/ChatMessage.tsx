'use client'

import { Message } from 'ai'
import { Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: Message
}

function parseContent(content: string): string {
  // Strip [ESTADO:*] markers
  return content.replace(/^\[ESTADO:(humano|soul_reaver)\]\n?/, '').trim()
}

function downloadMarkdown(content: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `raziel-${timestamp}.md`
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const cleanContent = typeof message.content === 'string'
    ? parseContent(message.content)
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end msg-appear">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-[#0ea5e9] text-white text-sm leading-relaxed">
          {cleanContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start msg-appear">
      <div
        className="group max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed
          bg-[#0d1117] border border-[#1a2744] text-[#e2e8f0] relative"
      >
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-[#00d4ff] prose-headings:font-semibold
          prose-strong:text-[#e2e8f0]
          prose-code:text-[#00d4ff] prose-code:bg-[#060810] prose-code:px-1 prose-code:rounded
          prose-pre:bg-[#060810] prose-pre:border prose-pre:border-[#1a2744]
          prose-a:text-[#0ea5e9]
          prose-li:text-[#cbd5e1]
          prose-p:text-[#e2e8f0]">
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>

        {cleanContent.length > 50 && (
          <button
            type="button"
            onClick={() => downloadMarkdown(cleanContent)}
            title="Descargar como .md"
            aria-label="Descargar este mensaje"
            className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100
              text-[#475569] hover:text-[#00d4ff]
              bg-[#060810]/80 border border-[#1a2744] hover:border-[#00d4ff]/40
              transition-all duration-200"
          >
            <Download size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start msg-appear">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#0d1117] border border-[#1a2744]">
        <div className="flex gap-1.5 items-center h-4">
          <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
          <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
          <div className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
        </div>
      </div>
    </div>
  )
}
