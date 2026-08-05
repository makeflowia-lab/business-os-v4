'use client'
import { useEffect } from 'react'

export interface Shortcut {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const s of shortcuts) {
        const metaMatch = s.meta ? (e.metaKey || e.ctrlKey) : true
        const ctrlMatch = s.ctrl ? e.ctrlKey : true
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey
        const altMatch = s.alt ? e.altKey : !e.altKey

        if (e.key.toLowerCase() === s.key.toLowerCase() && metaMatch && ctrlMatch && shiftMatch && altMatch) {
          // For meta/ctrl shortcuts, always execute (even in inputs)
          // For plain key shortcuts, skip when an input is focused
          if (!s.meta && !s.ctrl && isInputFocused()) continue

          e.preventDefault()
          s.action()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
