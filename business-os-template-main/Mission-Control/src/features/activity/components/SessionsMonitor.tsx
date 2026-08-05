'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bot, User, Star, Search, X, ArrowUp, ArrowDown,
  ChevronsUpDown, Loader2, SlidersHorizontal, Plus,
} from 'lucide-react'
import type { ChatMessage } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRow {
  id: string
  title: string
  is_favorite: boolean
  created_at: string
  updated_at: string
  message_count: number
}

type SortColumn = 'title' | 'message_count' | 'created_at' | 'updated_at'
type SortDir = 'asc' | 'desc'
type FilterField = 'title' | 'message_count' | 'is_favorite' | 'created_at' | 'updated_at'
type FilterOp =
  | 'contains' | 'not_contains'
  | 'eq' | 'gt' | 'lt'
  | 'is_true' | 'is_false'
  | 'last_n_days'

interface FilterRule {
  id: string
  field: FilterField
  op: FilterOp
  value: string
}

// ─── Field / operator definitions ────────────────────────────────────────────

const FIELDS: Record<FilterField, { label: string; type: 'text' | 'number' | 'bool' | 'date' }> = {
  title:       { label: 'Título',             type: 'text'   },
  message_count: { label: 'Mensajes',         type: 'number' },
  is_favorite: { label: 'Favorito',           type: 'bool'   },
  created_at:  { label: 'Fecha creado',       type: 'date'   },
  updated_at:  { label: 'Última actividad',   type: 'date'   },
}

const OPS_BY_TYPE: Record<string, Array<{ value: FilterOp; label: string }>> = {
  text:   [{ value: 'contains',     label: 'contiene'      },
           { value: 'not_contains', label: 'no contiene'   }],
  number: [{ value: 'gt',          label: 'mayor que'      },
           { value: 'lt',          label: 'menor que'      },
           { value: 'eq',          label: 'igual a'        }],
  bool:   [{ value: 'is_true',     label: 'es favorito'    },
           { value: 'is_false',    label: 'no es favorito' }],
  date:   [{ value: 'last_n_days', label: 'últimos N días' }],
}

function defaultOp(field: FilterField): FilterOp {
  return OPS_BY_TYPE[FIELDS[field].type][0].value
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (d < 7) return `${d}d`
  return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

function sessionId(dateStr: string): string {
  const d = new Date(dateStr)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `#${yy}${mm}${dd}-${hh}${min}`
}

function applyRule(s: SessionRow, rule: FilterRule): boolean {
  const v = rule.value.trim()
  switch (rule.op) {
    case 'contains':     return s.title.toLowerCase().includes(v.toLowerCase())
    case 'not_contains': return !s.title.toLowerCase().includes(v.toLowerCase())
    case 'eq':           return s.message_count === Number(v)
    case 'gt':           return s.message_count > Number(v)
    case 'lt':           return s.message_count < Number(v)
    case 'is_true':      return s.is_favorite === true
    case 'is_false':     return s.is_favorite === false
    case 'last_n_days': {
      const days = Number(v)
      if (isNaN(days) || v === '') return true
      const cutoff = Date.now() - days * 86400000
      const src = rule.field === 'created_at' ? s.created_at : s.updated_at
      return new Date(src).getTime() >= cutoff
    }
    default: return true
  }
}

function SortIcon({ col, active, dir }: { col: SortColumn; active: SortColumn; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={10} className="text-white/20 shrink-0" />
  return dir === 'asc'
    ? <ArrowUp size={10} className="text-violet-400 shrink-0" />
    : <ArrowDown size={10} className="text-violet-400 shrink-0" />
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters, onAdd, onRemove, onUpdate, onClear,
}: {
  filters: FilterRule[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<FilterRule>) => void
  onClear: () => void
}) {
  return (
    <div className="absolute top-full left-0 mt-2 z-30 w-[440px] rounded-xl bg-[#0d0d14] border border-white/[0.1] shadow-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold text-white/35 uppercase tracking-wider">Filtros activos</p>
        {filters.length > 0 && (
          <button onClick={onClear} className="text-[10px] text-white/20 hover:text-red-400 transition-colors">
            Limpiar todo
          </button>
        )}
      </div>

      {filters.length === 0 && (
        <p className="text-xs text-white/20 py-2 text-center">Sin filtros — agrega uno abajo</p>
      )}

      {filters.map((rule) => {
        const fieldType = FIELDS[rule.field].type
        const ops = OPS_BY_TYPE[fieldType]
        const needsValue = rule.op !== 'is_true' && rule.op !== 'is_false'
        return (
          <div key={rule.id} className="flex items-center gap-1.5">
            <select
              value={rule.field}
              onChange={(e) => {
                const f = e.target.value as FilterField
                onUpdate(rule.id, { field: f, op: defaultOp(f), value: '' })
              }}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-white/65 outline-none focus:border-white/20 cursor-pointer"
            >
              {(Object.entries(FIELDS) as [FilterField, { label: string }][]).map(([k, def]) => (
                <option key={k} value={k} className="bg-[#0d0d14]">{def.label}</option>
              ))}
            </select>

            <select
              value={rule.op}
              onChange={(e) => onUpdate(rule.id, { op: e.target.value as FilterOp, value: '' })}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-white/65 outline-none focus:border-white/20 cursor-pointer"
            >
              {ops.map((op) => (
                <option key={op.value} value={op.value} className="bg-[#0d0d14]">{op.label}</option>
              ))}
            </select>

            {needsValue && (
              <input
                type={fieldType === 'number' || fieldType === 'date' ? 'number' : 'text'}
                value={rule.value}
                onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
                placeholder={fieldType === 'date' ? 'días' : fieldType === 'number' ? '0' : 'valor...'}
                className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-white/65 outline-none focus:border-white/20 placeholder-white/20"
              />
            )}

            <button onClick={() => onRemove(rule.id)} className="p-1 text-white/20 hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          </div>
        )
      })}

      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] text-white/30 hover:text-white/55 hover:bg-white/[0.04] rounded-lg transition-colors w-fit mt-1"
      >
        <Plus size={11} />
        Agregar filtro
      </button>
    </div>
  )
}

// ─── Record modal ─────────────────────────────────────────────────────────────

function RecordModal({ session, onClose }: { session: SessionRow; onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('chat_messages')
        .select('id, session_id, role, content, created_at')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
      setMsgs((data as ChatMessage[]) ?? [])
      setLoading(false)
    }
    load()
  }, [session.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-[#0d0d14] border border-white/[0.09] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-start gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-violet-400/60 shrink-0">{sessionId(session.created_at)}</span>
              <span className="text-[10px] text-white/15">·</span>
              <span className="text-[9px] bg-violet-500/10 text-violet-400/60 border border-violet-500/15 rounded px-1.5 py-0.5 font-medium shrink-0">Agent</span>
            </div>
            <p className="text-sm font-semibold text-white leading-snug truncate">{session.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] text-white/30">{session.message_count} mensajes</span>
              <span className="text-[10px] text-white/15">·</span>
              <span className="text-[10px] text-white/30">activo {rel(session.updated_at)}</span>
              {session.is_favorite && <Star size={10} className="fill-amber-400/70 text-amber-400/70" />}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={16} className="text-white/25 animate-spin" /></div>
          ) : msgs.length === 0 ? (
            <p className="text-center py-10 text-white/25 text-sm">Sin mensajes</p>
          ) : (
            msgs.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex gap-2.5 items-end ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                    ${isUser ? 'bg-white/[0.08]' : 'bg-violet-500/20 border border-violet-400/20'}`}>
                    {isUser ? <User size={11} className="text-white/40" /> : <Bot size={11} className="text-violet-300" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${isUser ? 'rounded-br-sm bg-white/[0.1] text-white' : 'rounded-bl-sm bg-white/[0.05] border border-white/[0.06] text-white/85'}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[9px] mt-1 ${isUser ? 'text-white/25 text-right' : 'text-white/20'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SessionsMonitor() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SessionRow | null>(null)
  const [search, setSearch] = useState('')
  const [favOnly, setFavOnly] = useState(false)
  const [sortCol, setSortCol] = useState<SortColumn>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('chat_sessions')
        .select('id, title, is_favorite, created_at, updated_at, chat_messages(count)')
        .limit(200)
      if (data) {
        setSessions(
          data.map((s) => ({
            id: s.id as string,
            title: s.title as string,
            is_favorite: s.is_favorite as boolean,
            created_at: s.created_at as string,
            updated_at: s.updated_at as string,
            message_count: ((s.chat_messages as Array<{ count: number }>)?.[0]?.count ?? 0),
          })),
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  // Close filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  const toggleSort = useCallback((col: SortColumn) => {
    setSortCol((prev) => {
      if (prev === col) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); return col }
      setSortDir('desc')
      return col
    })
  }, [])

  const addFilter    = useCallback(() => setFilters((p) => [...p, { id: `f-${Date.now()}`, field: 'title', op: 'contains', value: '' }]), [])
  const removeFilter = useCallback((id: string) => setFilters((p) => p.filter((f) => f.id !== id)), [])
  const updateFilter = useCallback((id: string, patch: Partial<FilterRule>) => setFilters((p) => p.map((f) => f.id === id ? { ...f, ...patch } : f)), [])
  const clearFilters = useCallback(() => setFilters([]), [])

  const rows = useMemo(() => {
    let list = sessions.filter((s) => {
      if (favOnly && !s.is_favorite) return false
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      for (const rule of filters) { if (!applyRule(s, rule)) return false }
      return true
    })
    return [...list].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol]
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb, 'es')
        return sortDir === 'asc' ? cmp : -cmp
      }
      const cmp = (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sessions, search, favOnly, filters, sortCol, sortDir])

  const activeFilters = filters.filter((f) => f.value !== '' || f.op === 'is_true' || f.op === 'is_false').length

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-9 rounded-lg bg-white/[0.04] animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap relative" ref={filterRef}>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-44 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-white/[0.18] transition-colors"
          />
        </div>

        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors
            ${favOnly ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' : 'bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white/55 hover:bg-white/[0.06]'}`}
        >
          <Star size={11} className={favOnly ? 'fill-amber-400' : ''} />
          Favoritos
        </button>

        <button
          onClick={() => setFilterOpen((v) => !v)}
          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors
            ${filterOpen || activeFilters > 0
              ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
              : 'bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white/55 hover:bg-white/[0.06]'}`}
        >
          <SlidersHorizontal size={11} />
          Filtrar
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-500 text-[9px] text-white flex items-center justify-center font-medium">
              {activeFilters}
            </span>
          )}
        </button>

        <span className="ml-auto text-[10px] text-white/25">
          {rows.length}{rows.length !== sessions.length ? ` / ${sessions.length}` : ''} sesiones
        </span>

        {filterOpen && (
          <FilterPanel filters={filters} onAdd={addFilter} onRemove={removeFilter} onUpdate={updateFilter} onClear={clearFilters} />
        )}
      </div>

      {/* ── Grid ── */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">

        {/* Headers */}
        <div className="grid grid-cols-[28px_92px_1fr_52px_32px_88px_68px_68px] border-b border-white/[0.07] bg-white/[0.025]">
          <div className="px-2 py-2 text-[9px] text-white/20 font-semibold uppercase tracking-wider text-center">#</div>
          <div className="px-3 py-2 text-[9px] text-white/30 font-semibold uppercase tracking-wider">ID</div>
          <button onClick={() => toggleSort('title')} className="flex items-center gap-1 px-3 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors text-left">
            Título <SortIcon col="title" active={sortCol} dir={sortDir} />
          </button>
          <button onClick={() => toggleSort('message_count')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Msg <SortIcon col="message_count" active={sortCol} dir={sortDir} />
          </button>
          <div className="px-1 py-2 flex items-center justify-center"><Star size={9} className="text-white/20" /></div>
          <div className="px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider">Agente</div>
          <button onClick={() => toggleSort('created_at')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Creado <SortIcon col="created_at" active={sortCol} dir={sortDir} />
          </button>
          <button onClick={() => toggleSort('updated_at')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Activo <SortIcon col="updated_at" active={sortCol} dir={sortDir} />
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04] max-h-[540px] overflow-y-auto">
          {rows.length === 0 ? (
            <div className="py-14 text-center text-white/20 text-xs">Sin resultados</div>
          ) : (
            rows.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="w-full grid grid-cols-[28px_92px_1fr_52px_32px_88px_68px_68px] items-center hover:bg-white/[0.04] transition-colors group"
              >
                <span className="px-2 py-2.5 text-[10px] text-white/15 text-center tabular-nums">{i + 1}</span>
                <span className="px-3 py-2.5 text-[10px] font-mono text-violet-400/50 truncate group-hover:text-violet-400/70 transition-colors">
                  {sessionId(s.created_at)}
                </span>
                <span className="px-3 py-2.5 text-xs text-white/65 truncate group-hover:text-white/80 transition-colors text-left">
                  {s.title}
                </span>
                <span className="px-2 py-2.5 text-[10px] text-white/35 text-center tabular-nums">{s.message_count}</span>
                <span className="px-1 py-2.5 flex items-center justify-center">
                  {s.is_favorite && <Star size={10} className="fill-amber-400/60 text-amber-400/60" />}
                </span>
                <span className="px-2 py-2.5">
                  <span className="text-[9px] bg-violet-500/10 text-violet-400/60 border border-violet-500/15 rounded px-1.5 py-0.5 font-medium">
                    Agent
                  </span>
                </span>
                <span className="px-2 py-2.5 text-[10px] text-white/25 text-center tabular-nums">{rel(s.created_at)}</span>
                <span className="px-2 py-2.5 text-[10px] text-white/25 text-center tabular-nums">{rel(s.updated_at)}</span>
              </button>
            ))
          )}
        </div>

        {rows.length > 0 && (
          <div className="px-3 py-2 border-t border-white/[0.04] bg-white/[0.015] flex items-center justify-between">
            <span className="text-[9px] text-white/15">{rows.reduce((a, s) => a + s.message_count, 0)} mensajes totales</span>
            <span className="text-[9px] text-white/15">↵ click en fila para abrir</span>
          </div>
        )}
      </div>

      {selected && <RecordModal session={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
