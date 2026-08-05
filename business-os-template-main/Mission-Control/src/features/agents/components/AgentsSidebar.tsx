'use client'
import { useState } from 'react'
import { AgentCard } from './AgentCard'
import { AgentManageModal } from './AgentManageModal'
import { Users, Plus, Settings } from 'lucide-react'
import type { Agent } from '@/types/database'

interface AgentsSidebarProps {
  agents: Agent[]
  loading: boolean
  selectedAgentId?: string
  onSelectAgent?: (id: string | undefined) => void
}

export function AgentsSidebar({ agents, loading, selectedAgentId, onSelectAgent }: AgentsSidebarProps) {
  const activeCount = agents.filter(a => a.status === 'active').length
  const [modalOpen, setModalOpen] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)

  const handleCreate = () => {
    setEditAgent(null)
    setModalOpen(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditAgent(agent)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white/80 tracking-wide">Agents</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
            <button
              onClick={handleCreate}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"
              title="Add agent"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="group relative">
              <AgentCard
                agent={agent}
                selected={selectedAgentId === agent.id}
                onClick={() => onSelectAgent?.(selectedAgentId === agent.id ? undefined : agent.id)}
              />
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(agent) }}
                className="absolute top-3 right-3 p-1 rounded-lg bg-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.1] transition-all opacity-0 group-hover:opacity-100"
                title="Edit agent"
              >
                <Settings size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      <AgentManageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        agent={editAgent}
      />
    </div>
  )
}
