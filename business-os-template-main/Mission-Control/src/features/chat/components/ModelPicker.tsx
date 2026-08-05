'use client'
import { useEffect, useRef, useState } from 'react'
import { Cpu, Loader2 } from 'lucide-react'

interface ModelInfo {
  value: string
  displayName: string
  description: string
  supportsEffort?: boolean
}

interface Props {
  onSelect: (modelValue: string) => void
  onClose: () => void
}

export function ModelPicker({ onSelect, onClose }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Fetch models from Agent Server
  useEffect(() => {
    fetch('/api/chat/models')
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(0, i - 1))
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(models.length - 1, i + 1))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const model = models[selectedIndex]
        if (model) onSelect(model.value)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [models, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll<HTMLElement>('[data-model]')
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-full bg-[#111118]/96 backdrop-blur-xl border border-white/[0.10] rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.35),0_-16px_48px_rgba(0,0,0,0.75)] overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-white/[0.07] bg-white/[0.02]">
        <div className="w-4 h-4 rounded-md bg-cyan-500/20 flex items-center justify-center">
          <Cpu size={9} className="text-cyan-400" />
        </div>
        <span className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Models</span>
        <span className="ml-auto text-[9px] text-white/20 hidden sm:block font-mono">
          ↑↓ · Enter · Esc
        </span>
      </div>

      {/* Model list */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-white/30">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Loading models...</span>
        </div>
      ) : models.length === 0 ? (
        <div className="py-4 px-3.5 text-xs text-white/30 text-center">
          Could not load models
        </div>
      ) : (
        <ul ref={listRef} className="py-1 max-h-64 overflow-y-auto overscroll-contain">
          {models.map((model, i) => {
            const active = i === selectedIndex
            return (
              <li key={model.value} data-model>
                <button
                  onMouseDown={(e) => { e.preventDefault(); onSelect(model.value) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    active ? 'bg-cyan-500/[0.10]' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/15 text-cyan-400">
                    <Cpu size={15} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`block text-[13px] font-mono font-semibold transition-colors ${active ? 'text-white/95' : 'text-white/75'}`}>
                      {model.displayName}
                    </span>
                    <span className={`block text-[11px] truncate mt-0.5 transition-colors ${active ? 'text-white/50' : 'text-white/28'}`}>
                      {model.description}
                    </span>
                  </div>
                  {model.supportsEffort && (
                    <span className="shrink-0 text-[8px] font-mono text-cyan-400/50 bg-cyan-500/10 px-1.5 py-0.5 rounded-md">
                      effort
                    </span>
                  )}
                  {active && (
                    <span className="shrink-0 text-[9px] font-mono text-cyan-400/60 bg-cyan-500/10 px-1.5 py-0.5 rounded-md hidden sm:block">
                      Enter
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
