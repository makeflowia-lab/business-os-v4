'use client'

import { FormEvent, KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({
  value = '',
  onChange,
  onSubmit,
  isLoading,
  placeholder = 'Escribe tu pregunta...',
}: ChatInputProps) {
  const safeValue = value || ''

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (safeValue.trim() && !isLoading) {
        onSubmit(e as unknown as FormEvent)
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="bg-neu-bg rounded-2xl shadow-neu-inset p-2">
        <textarea
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={2}
          className="
            w-full bg-transparent resize-none
            px-4 py-2 text-gray-700
            placeholder-gray-400
            outline-none
            disabled:opacity-50
          "
        />
        <div className="flex justify-end px-2">
          <button
            type="submit"
            disabled={!safeValue.trim() || isLoading}
            className="
              bg-neu-bg rounded-xl
              shadow-neu hover:shadow-neu-inset
              px-4 py-2
              text-blue-600 font-medium text-sm
              transition-shadow duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Pensando...
              </>
            ) : (
              <>
                Enviar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
