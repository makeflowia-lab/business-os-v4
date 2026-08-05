'use client'
import type { Agent, AgentStatus, AgentLevel } from '@/types/database'

const STATUS_COLORS: Record<AgentStatus, string> = {
  active: 'bg-emerald-400',
  idle: 'bg-white/30',
  blocked: 'bg-red-400',
}

const LEVEL_STYLES: Record<AgentLevel, string> = {
  LEAD: 'text-purple-300 bg-purple-400/10 border-purple-400/20',
  INT: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  SPC: 'text-white/50 bg-white/[0.06] border-white/[0.1]',
}

interface AgentCardProps {
  agent: Agent
  selected?: boolean
  onClick?: () => void
}

export function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group
        ${selected
          ? 'bg-white/[0.12] border border-white/[0.15]'
          : 'hover:bg-white/[0.06] border border-transparent'
        }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <span className="text-2xl">{agent.avatar}</span>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0f] ${STATUS_COLORS[agent.status]}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{agent.name}</span>
            <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${LEVEL_STYLES[agent.level]}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-xs text-white/40 truncate mt-0.5">{agent.role}</p>
        </div>
      </div>
    </button>
  )
}
