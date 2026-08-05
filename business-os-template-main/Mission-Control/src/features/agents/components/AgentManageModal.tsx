'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Trash2, AlertCircle } from 'lucide-react'
import type { Agent, AgentStatus, AgentLevel } from '@/types/database'

const AVATARS = [
  '🤖', '🧠', '🦾', '🐙', '🦊', '🐺', '🦅', '🐉', '🦁', '🐸', '🦞', '🐝',
  '🌸', '🎬', '🔥', '🚀', '💎', '🐱', '🐶', '🦄', '🪐', '⚡', '🎯', '🦉',
]
const STATUSES: AgentStatus[] = ['idle', 'active', 'blocked']
const LEVELS: AgentLevel[] = ['LEAD', 'INT', 'SPC']

type Tab = 'basic' | 'personality'

interface AgentManageModalProps {
  isOpen: boolean
  onClose: () => void
  agent?: Agent | null
  onSave?: () => void
}

export function AgentManageModal({ isOpen, onClose, agent, onSave }: AgentManageModalProps) {
  const isEditing = !!agent

  const [tab, setTab] = useState<Tab>('basic')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [avatar, setAvatar] = useState('🤖')
  const [status, setStatus] = useState<AgentStatus>('idle')
  const [level, setLevel] = useState<AgentLevel>('SPC')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [character, setCharacter] = useState('')
  const [lore, setLore] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setRole(agent.role)
      setAvatar(agent.avatar)
      setStatus(agent.status)
      setLevel(agent.level)
      setSystemPrompt(agent.system_prompt ?? '')
      setCharacter(agent.character ?? '')
      setLore(agent.lore ?? '')
    } else {
      setName('')
      setRole('')
      setAvatar('🤖')
      setStatus('idle')
      setLevel('SPC')
      setSystemPrompt('')
      setCharacter('')
      setLore('')
    }
    setConfirmDelete(false)
    setError(null)
    setTab('basic')
  }, [agent, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      name: name.trim(),
      role: role.trim(),
      avatar,
      status,
      level,
      system_prompt: systemPrompt.trim() || null,
      character: character.trim() || null,
      lore: lore.trim() || null,
    }

    if (isEditing) {
      const { error: updateError } = await supabase.from('agents').update(payload).eq('id', agent.id)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('agents').insert(payload)
      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onSave?.()
    onClose()
  }

  const handleDelete = async () => {
    if (!agent) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from('agents').delete().eq('id', agent.id)
    if (deleteError) {
      setError(deleteError.message)
      setSaving(false)
      return
    }
    setSaving(false)
    onSave?.()
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        w-full max-w-lg bg-[#12121a] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white/80">
            {isEditing ? 'Edit Agent' : 'New Agent'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {(['basic', 'personality'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors
                ${tab === t
                  ? 'text-white/80 border-b-2 border-white/30'
                  : 'text-white/30 hover:text-white/50'
                }`}
            >
              {t === 'basic' ? 'Basic Info' : 'Personality'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {tab === 'basic' ? (
            <>
              {/* Avatar picker */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-2 block">Avatar</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all
                        ${avatar === a ? 'bg-white/[0.12] ring-1 ring-white/[0.2] scale-110' : 'bg-white/[0.04] hover:bg-white/[0.08]'}
                      `}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent name..."
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/[0.2]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. AI Assistant, Code Reviewer..."
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.2]"
                />
              </div>

              {/* Level + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as AgentLevel)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AgentStatus)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/60 outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* System Prompt */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">System Prompt</label>
                <p className="text-[10px] text-white/20 mb-2">Core instructions that define what this agent does</p>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful AI assistant that..."
                  rows={4}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.2] resize-none"
                />
              </div>

              {/* Character */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Character</label>
                <p className="text-[10px] text-white/20 mb-2">Personality traits, tone, communication style</p>
                <textarea
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  placeholder="Friendly, concise, proactive..."
                  rows={3}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.2] resize-none"
                />
              </div>

              {/* Lore */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-white/40 mb-1 block">Lore</label>
                <p className="text-[10px] text-white/20 mb-2">Background context, knowledge areas, capabilities</p>
                <textarea
                  value={lore}
                  onChange={(e) => setLore(e.target.value)}
                  placeholder="Specializes in TypeScript, has access to..."
                  rows={3}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.2] resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
          <div>
            {isEditing && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Confirm?</span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-white/40 hover:text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete agent
                </button>
              )
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.1] text-white/80 border border-white/[0.12] hover:bg-white/[0.15] transition-colors disabled:opacity-30"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Agent'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
