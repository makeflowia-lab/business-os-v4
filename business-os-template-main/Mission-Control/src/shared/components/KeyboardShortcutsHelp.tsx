'use client'
import { X } from 'lucide-react'

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['J'], description: 'Move focus down' },
      { keys: ['K'], description: 'Move focus up' },
      { keys: ['Enter'], description: 'Open focused task' },
      { keys: ['Esc'], description: 'Close panel / deselect' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['C'], description: 'Create new task' },
      { keys: ['S'], description: 'Change status' },
      { keys: ['P'], description: 'Change priority' },
      { keys: ['A'], description: 'Assign agent' },
      { keys: ['X'], description: 'Mark done' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: ['Cmd', 'K'], description: 'Search / Commands' },
      { keys: ['['], description: 'Toggle sidebar' },
      { keys: ['L'], description: 'Toggle chat bubble' },
      { keys: ['?'], description: 'Show shortcuts' },
    ],
  },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md bg-[#12121a] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Specular rim */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-xs text-white/60">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="min-w-[24px] px-1.5 py-0.5 text-[10px] font-mono text-center text-white/70 bg-white/[0.08] border border-white/[0.1] rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
