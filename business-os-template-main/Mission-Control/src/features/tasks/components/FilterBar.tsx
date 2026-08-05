'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFiltersStore, type TaskFilters } from '@/shared/stores/filters-store'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/priority'
import { Filter, X, Save, ChevronDown, Bookmark } from 'lucide-react'
import type { TaskPriority, TaskStatus, Label, Profile } from '@/types/database'

interface SavedView {
  id: string
  name: string
  filters: TaskFilters
  view_type: string
  is_default: boolean | null
  created_at: string | null
}

export function FilterBar() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFiltersStore()
  const [labels, setLabels] = useState<Label[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [savedViews, setSavedViews] = useState<SavedView[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [saveViewName, setSaveViewName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [showViewPicker, setShowViewPicker] = useState(false)

  const fetchData = useCallback(async () => {
    if (dataLoaded) return
    const supabase = createClient()
    const [labelsRes, profilesRes, viewsRes] = await Promise.all([
      supabase.from('labels').select('*').order('name'),
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('saved_views').select('*').order('name'),
    ])
    if (labelsRes.data) setLabels(labelsRes.data as Label[])
    if (profilesRes.data) setMembers(profilesRes.data as Profile[])
    if (viewsRes.data) setSavedViews(viewsRes.data as unknown as SavedView[])
    setDataLoaded(true)
  }, [dataLoaded])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Close dropdowns on outside click
  useEffect(() => {
    if (!activeDropdown) return
    const handleClick = () => setActiveDropdown(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [activeDropdown])

  const active = hasActiveFilters()

  const handleSaveView = async () => {
    if (!saveViewName.trim()) return
    const supabase = createClient()
    const { data } = await supabase.from('saved_views').insert({
      name: saveViewName.trim(),
      filters: filters as unknown as Record<string, unknown>,
      view_type: 'kanban',
    }).select('*').single()
    if (data) {
      setSavedViews((prev) => [...prev, data as unknown as SavedView])
    }
    setSaveViewName('')
    setShowSaveInput(false)
  }

  const handleLoadView = (view: SavedView) => {
    const f = view.filters
    if (f.priority !== undefined) setFilter('priority', f.priority)
    if (f.assigneeId !== undefined) setFilter('assigneeId', f.assigneeId)
    if (f.labelId !== undefined) setFilter('labelId', f.labelId)
    if (f.status !== undefined) setFilter('status', f.status)
    if (f.search !== undefined) setFilter('search', f.search)
    setShowViewPicker(false)
  }

  const handleDeleteView = async (viewId: string) => {
    const supabase = createClient()
    await supabase.from('saved_views').delete().eq('id', viewId)
    setSavedViews((prev) => prev.filter((v) => v.id !== viewId))
  }

  const removePill = (key: keyof TaskFilters) => {
    if (key === 'search') setFilter('search', '')
    else setFilter(key, null)
  }

  // Get display text for active pills
  const activePills: { key: keyof TaskFilters; label: string; color?: string }[] = []
  if (filters.priority !== null) {
    const p = PRIORITY_CONFIG[filters.priority]
    activePills.push({ key: 'priority', label: `${p.icon} ${p.label}` })
  }
  if (filters.assigneeId) {
    const member = members.find((m) => m.id === filters.assigneeId)
    activePills.push({ key: 'assigneeId', label: member?.full_name ?? 'Member' })
  }
  if (filters.labelId) {
    const label = labels.find((l) => l.id === filters.labelId)
    activePills.push({ key: 'labelId', label: label?.name ?? 'Label', color: label?.color })
  }
  if (filters.status !== null) {
    const s = STATUS_CONFIG[filters.status]
    activePills.push({ key: 'status', label: `${s.icon} ${s.label}` })
  }
  if (filters.search) {
    activePills.push({ key: 'search', label: `"${filters.search}"` })
  }

  return (
    <div className="px-4 py-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Filter toggle */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'main' ? null : 'main')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors border
              ${active
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                : 'border-white/[0.06] text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              }
            `}
          >
            <Filter size={12} />
            Filter
            <ChevronDown size={10} />
          </button>

          {activeDropdown === 'main' && (
            <div className="absolute top-full left-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-xl overflow-hidden z-20 shadow-xl shadow-black/40 min-w-[180px]">
              {/* Status */}
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/25 font-semibold">Status</div>
              {(['backlog', 'todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => { setFilter('status', filters.status === s ? null : s); setActiveDropdown(null) }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                      ${filters.status === s ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.06]'}
                    `}
                  >
                    <span className={cfg.color}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              })}

              <div className="border-t border-white/[0.06] my-1" />

              {/* Priority */}
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/25 font-semibold">Priority</div>
              {([1, 2, 3, 4] as TaskPriority[]).map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p}
                    onClick={() => { setFilter('priority', filters.priority === p ? null : p); setActiveDropdown(null) }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                      ${filters.priority === p ? 'bg-white/[0.08] text-white' : `text-white/50 hover:bg-white/[0.06]`}
                    `}
                  >
                    <span className={cfg.color}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              })}

              <div className="border-t border-white/[0.06] my-1" />

              {/* Assignee */}
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/25 font-semibold">Assignee</div>
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setFilter('assigneeId', filters.assigneeId === m.id ? null : m.id); setActiveDropdown(null) }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                    ${filters.assigneeId === m.id ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.06]'}
                  `}
                >
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/[0.1] flex items-center justify-center text-[9px] text-white/60">{(m.full_name ?? '?')[0]}</span>
                  )}
                  {m.full_name ?? m.email ?? 'User'}
                </button>
              ))}

              <div className="border-t border-white/[0.06] my-1" />

              {/* Labels */}
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/25 font-semibold">Label</div>
              {labels.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setFilter('labelId', filters.labelId === l.id ? null : l.id); setActiveDropdown(null) }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors
                    ${filters.labelId === l.id ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.06]'}
                  `}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active filter pills */}
        {activePills.map((pill) => (
          <span
            key={pill.key}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300"
            style={pill.color ? { backgroundColor: `${pill.color}15`, borderColor: `${pill.color}30`, color: pill.color } : {}}
          >
            {pill.label}
            <button
              onClick={() => removePill(pill.key)}
              className="hover:text-white transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {/* Clear all */}
        {active && (
          <button
            onClick={resetFilters}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
          >
            Clear all
          </button>
        )}

        {/* Search pill */}
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Search..."
          className="bg-transparent border-none text-[11px] text-white/60 placeholder:text-white/20 outline-none w-20 focus:w-32 transition-all"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Saved Views */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowViewPicker(!showViewPicker)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
          >
            <Bookmark size={10} />
            Views
            {savedViews.length > 0 && (
              <span className="text-[9px] bg-white/[0.06] px-1 rounded-full">{savedViews.length}</span>
            )}
          </button>

          {showViewPicker && (
            <div className="absolute top-full right-0 mt-1 bg-[#15151f] border border-white/[0.1] rounded-xl overflow-hidden z-20 shadow-xl shadow-black/40 min-w-[200px]">
              {savedViews.length > 0 ? (
                savedViews.map((view) => (
                  <div key={view.id} className="flex items-center group">
                    <button
                      onClick={() => handleLoadView(view)}
                      className="flex-1 text-left px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
                    >
                      {view.name}
                    </button>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="px-2 py-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/20 px-3 py-2">No saved views</p>
              )}
            </div>
          )}
        </div>

        {/* Save current as view */}
        {active && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {showSaveInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={saveViewName}
                  onChange={(e) => setSaveViewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveView()
                    if (e.key === 'Escape') setShowSaveInput(false)
                  }}
                  placeholder="View name..."
                  autoFocus
                  className="bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 text-[10px] text-white/60 placeholder:text-white/20 outline-none w-24"
                />
                <button
                  onClick={handleSaveView}
                  disabled={!saveViewName.trim()}
                  className="p-0.5 text-white/30 hover:text-emerald-400 transition-colors disabled:opacity-30"
                >
                  <Save size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
              >
                <Save size={10} />
                Save view
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
