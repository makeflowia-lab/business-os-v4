'use client'
import { useState } from 'react'
import { useTemplatesStore, type TaskTemplate } from '@/shared/stores/templates-store'
import { PRIORITY_CONFIG } from '../utils/priority'
import { Bookmark, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react'

interface TemplatesPickerProps {
  onSelect: (template: TaskTemplate) => void
}

export function TemplatesPicker({ onSelect }: TemplatesPickerProps) {
  const templates = useTemplatesStore((s) => s.templates)
  const removeTemplate = useTemplatesStore((s) => s.removeTemplate)
  const [isExpanded, setIsExpanded] = useState(false)

  if (templates.length === 0) return null

  return (
    <div className="border-t border-white/[0.06] pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors"
      >
        <Bookmark size={10} />
        Templates ({templates.length})
        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {templates.map((tpl) => {
            const pConfig = PRIORITY_CONFIG[tpl.priority]
            return (
              <div
                key={tpl.id}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group"
              >
                <button
                  onClick={() => onSelect(tpl)}
                  className="flex-1 text-left flex items-center gap-2 min-w-0"
                >
                  <Plus size={12} className="text-white/30 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-white/70 truncate block">{tpl.name}</span>
                    <span className="text-[10px] text-white/30 truncate block">
                      {pConfig.icon} {tpl.title}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => removeTemplate(tpl.id)}
                  className="p-1 rounded text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
