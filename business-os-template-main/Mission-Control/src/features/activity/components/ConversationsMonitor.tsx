'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Bot, User, Star, Search, X, ArrowUp, ArrowDown,
  ChevronsUpDown, Loader2, SlidersHorizontal, Plus,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
import type { Conversation } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConvRow {
  id: string
  run_id: string
  prompt: string
  response: string | null
  source: string
  status: 'pending' | 'done' | 'error'
  error: string | null
  started_at: string
  ended_at: string | null
  created_at: string
  agent_name: string | null
  agent_avatar: string | null
}

type SortCol = 'prompt' | 'status' | 'started_at' | 'duration'
type SortDir = 'asc' | 'desc'
type FilterField = 'prompt' | 'status' | 'started_at'
type FilterOp = 'contains' | 'not_contains' | 'eq' | 'last_n_days'

interface FilterRule {
  id: string
  field: FilterField
  op: FilterOp
  value: string
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

function convId(runId: string, startedAt: string): string {
  const d = new Date(startedAt)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `#${yy}${mm}${dd}-${hh}${min}`
}

function duration(started: string, ended: string | null): string {
  if (!ended) return '—'
  const ms = new Date(ended).getTime() - new Date(started).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function applyRule(row: ConvRow, rule: FilterRule): boolean {
  const v = rule.value.trim()
  if (rule.field === 'prompt') {
    if (rule.op === 'contains')     return row.prompt.toLowerCase().includes(v.toLowerCase())
    if (rule.op === 'not_contains') return !row.prompt.toLowerCase().includes(v.toLowerCase())
  }
  if (rule.field === 'status' && rule.op === 'eq') return row.status === v
  if (rule.field === 'started_at' && rule.op === 'last_n_days') {
    const days = Number(v)
    if (isNaN(days) || v === '') return true
    return new Date(row.started_at).getTime() >= Date.now() - days * 86400000
  }
  return true
}

const FIELDS: Record<FilterField, { label: string; type: string }> = {
  prompt:     { label: 'Mensaje',      type: 'text' },
  status:     { label: 'Estado',       type: 'status' },
  started_at: { label: 'Fecha',        type: 'date' },
}

const OPS: Record<string, Array<{ value: FilterOp; label: string }>> = {
  text:   [{ value: 'contains',     label: 'contiene'      },
           { value: 'not_contains', label: 'no contiene'   }],
  status: [{ value: 'eq',           label: 'igual a'       }],
  date:   [{ value: 'last_n_days',  label: 'últimos N días' }],
}

function defaultOp(field: FilterField): FilterOp {
  return OPS[FIELDS[field].type][0].value
}

function SortIcon({ col, active, dir }: { col: SortCol; active: SortCol; dir: SortDir }) {
  if (col !== active) return <ChevronsUpDown size={10} className="text-white/20 shrink-0" />
  return dir === 'asc'
    ? <ArrowUp size={10} className="text-violet-400 shrink-0" />
    : <ArrowDown size={10} className="text-violet-400 shrink-0" />
}

function StatusBadge({ status }: { status: ConvRow['status'] }) {
  if (status === 'done')    return <span className="flex items-center gap-1 text-[9px] text-emerald-400/80 bg-emerald-400/10 border border-emerald-400/20 rounded px-1.5 py-0.5"><CheckCircle2 size={8} />done</span>
  if (status === 'error')   return <span className="flex items-center gap-1 text-[9px] text-red-400/80 bg-red-400/10 border border-red-400/20 rounded px-1.5 py-0.5"><AlertCircle size={8} />error</span>
  return <span className="flex items-center gap-1 text-[9px] text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5"><Clock size={8} />pending</span>
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
          <button onClick={onClear} className="text-[10px] text-white/20 hover:text-red-400 transition-colors">Limpiar todo</button>
        )}
      </div>

      {filters.length === 0 && (
        <p className="text-xs text-white/20 py-2 text-center">Sin filtros — agrega uno abajo</p>
      )}

      {filters.map((rule) => {
        const fieldType = FIELDS[rule.field].type
        const ops = OPS[fieldType]
        const needsValue = true
        return (
          <div key={rule.id} className="flex items-center gap-1.5">
            <select
              value={rule.field}
              onChange={(e) => { const f = e.target.value as FilterField; onUpdate(rule.id, { field: f, op: defaultOp(f), value: '' }) }}
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
                type={fieldType === 'date' ? 'number' : 'text'}
                value={rule.value}
                onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
                placeholder={fieldType === 'date' ? 'días' : fieldType === 'status' ? 'done / error / pending' : 'valor...'}
                className="w-28 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[11px] text-white/65 outline-none focus:border-white/20 placeholder-white/20"
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

function RecordModal({ row, onClose }: { row: ConvRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-[#0d0d14] border border-white/[0.09] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] font-mono text-violet-400/60">{convId(row.run_id, row.started_at)}</span>
              <span className="text-[10px] text-white/15">·</span>
              <span className="text-[9px] bg-blue-500/10 text-blue-400/60 border border-blue-500/15 rounded px-1.5 py-0.5 font-medium">
                {row.agent_name ?? 'Agent'}
              </span>
              <span className="text-[10px] text-white/15">·</span>
              <StatusBadge status={row.status} />
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
              <span>iniciado {rel(row.started_at)}</span>
              {row.ended_at && (
                <><span className="text-white/15">·</span><span>{duration(row.started_at, row.ended_at)}</span></>
              )}
              <span className="text-white/15">·</span>
              <span className="text-white/30">{row.source}</span>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {/* User message */}
          <div className="flex gap-2.5 items-end flex-row-reverse">
            <div className="shrink-0 w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center">
              <User size={11} className="text-white/40" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-white/[0.1] px-3.5 py-2.5 text-sm text-white leading-relaxed">
              <p className="whitespace-pre-wrap break-words">{row.prompt}</p>
              <p className="text-[9px] text-white/25 mt-1 text-right">
                {new Date(row.started_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Agent response */}
          {row.status === 'done' && row.response && (
            <div className="flex gap-2.5 items-end">
              <div className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-400/20 flex items-center justify-center">
                <Bot size={11} className="text-violet-300" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 text-sm text-white/85 leading-relaxed">
                <p className="whitespace-pre-wrap break-words">{row.response}</p>
                {row.ended_at && (
                  <p className="text-[9px] text-white/20 mt-1">
                    {new Date(row.ended_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}{duration(row.started_at, row.ended_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {row.status === 'error' && (
            <div className="flex gap-2.5 items-end">
              <div className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 border border-red-400/20 flex items-center justify-center">
                <AlertCircle size={11} className="text-red-300" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-sm text-red-300 leading-relaxed">
                <p className="whitespace-pre-wrap break-words">{row.error ?? 'Error desconocido'}</p>
              </div>
            </div>
          )}

          {row.status === 'pending' && (
            <div className="flex gap-2 items-center text-white/30 text-xs">
              <Loader2 size={12} className="animate-spin" />
              Esperando respuesta...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ConversationsMonitor() {
  const [rows, setRows] = useState<ConvRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ConvRow | null>(null)
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('started_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('id, run_id, prompt, response, source, status, error, started_at, ended_at, created_at, agents(name, avatar)')
        .order('started_at', { ascending: false })
        .limit(200)
      if (data) {
        setRows(
          data.map((c) => ({
            id:           c.id as string,
            run_id:       c.run_id as string,
            prompt:       c.prompt as string,
            response:     c.response as string | null,
            source:       (c.source ?? 'mission-control') as string,
            status:       (c.status ?? 'pending') as ConvRow['status'],
            error:        c.error as string | null,
            started_at:   c.started_at as string,
            ended_at:     c.ended_at as string | null,
            created_at:   c.created_at as string,
            agent_name:   ((c.agents as { name?: string } | null)?.name ?? null),
            agent_avatar: ((c.agents as { avatar?: string } | null)?.avatar ?? null),
          })),
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!filterOpen) return
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  const toggleSort = useCallback((col: SortCol) => {
    setSortCol((prev) => {
      if (prev === col) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); return col }
      setSortDir('desc'); return col
    })
  }, [])

  const addFilter    = useCallback(() => setFilters((p) => [...p, { id: `f-${Date.now()}`, field: 'prompt', op: 'contains', value: '' }]), [])
  const removeFilter = useCallback((id: string) => setFilters((p) => p.filter((f) => f.id !== id)), [])
  const updateFilter = useCallback((id: string, patch: Partial<FilterRule>) => setFilters((p) => p.map((f) => f.id === id ? { ...f, ...patch } : f)), [])
  const clearFilters = useCallback(() => setFilters([]), [])

  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (search && !r.prompt.toLowerCase().includes(search.toLowerCase())) return false
      for (const rule of filters) { if (!applyRule(r, rule)) return false }
      return true
    })
    return [...list].sort((a, b) => {
      if (sortCol === 'prompt') {
        const cmp = a.prompt.localeCompare(b.prompt, 'es')
        return sortDir === 'asc' ? cmp : -cmp
      }
      if (sortCol === 'status') {
        const cmp = a.status.localeCompare(b.status)
        return sortDir === 'asc' ? cmp : -cmp
      }
      if (sortCol === 'duration') {
        const da = a.ended_at ? new Date(a.ended_at).getTime() - new Date(a.started_at).getTime() : 0
        const db = b.ended_at ? new Date(b.ended_at).getTime() - new Date(b.started_at).getTime() : 0
        return sortDir === 'asc' ? da - db : db - da
      }
      // started_at
      const cmp = a.started_at.localeCompare(b.started_at)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, search, filters, sortCol, sortDir])

  const activeFilters = filters.filter((f) => f.value !== '').length

  const stats = useMemo(() => ({
    done:    rows.filter((r) => r.status === 'done').length,
    pending: rows.filter((r) => r.status === 'pending').length,
    errors:  rows.filter((r) => r.status === 'error').length,
  }), [rows])

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-9 rounded-lg bg-white/[0.04] animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Stats strip ── */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-emerald-400/70 bg-emerald-400/10 border border-emerald-400/15 rounded px-2 py-1">
          ✓ {stats.done} completadas
        </span>
        {stats.pending > 0 && (
          <span className="text-[10px] text-amber-400/70 bg-amber-400/10 border border-amber-400/15 rounded px-2 py-1">
            ⏳ {stats.pending} pendientes
          </span>
        )}
        {stats.errors > 0 && (
          <span className="text-[10px] text-red-400/70 bg-red-400/10 border border-red-400/15 rounded px-2 py-1">
            ✗ {stats.errors} errores
          </span>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap relative" ref={filterRef}>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar mensaje..."
            className="w-48 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-white/[0.18] transition-colors"
          />
        </div>

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
          {filtered.length}{filtered.length !== rows.length ? ` / ${rows.length}` : ''} conversaciones
        </span>

        {filterOpen && (
          <FilterPanel filters={filters} onAdd={addFilter} onRemove={removeFilter} onUpdate={updateFilter} onClear={clearFilters} />
        )}
      </div>

      {/* ── Grid ── */}
      <div className="rounded-xl border border-white/[0.07] overflow-hidden">

        {/* Headers */}
        <div className="grid grid-cols-[28px_92px_1fr_76px_88px_72px_68px] border-b border-white/[0.07] bg-white/[0.025]">
          <div className="px-2 py-2 text-[9px] text-white/20 font-semibold uppercase tracking-wider text-center">#</div>
          <div className="px-3 py-2 text-[9px] text-white/30 font-semibold uppercase tracking-wider">ID</div>
          <button onClick={() => toggleSort('prompt')} className="flex items-center gap-1 px-3 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors text-left">
            Mensaje <SortIcon col="prompt" active={sortCol} dir={sortDir} />
          </button>
          <button onClick={() => toggleSort('status')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Estado <SortIcon col="status" active={sortCol} dir={sortDir} />
          </button>
          <div className="px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider">Agente</div>
          <button onClick={() => toggleSort('duration')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Duración <SortIcon col="duration" active={sortCol} dir={sortDir} />
          </button>
          <button onClick={() => toggleSort('started_at')} className="flex items-center justify-center gap-1 px-2 py-2 text-[9px] text-white/35 font-semibold uppercase tracking-wider hover:text-white/55 transition-colors">
            Inicio <SortIcon col="started_at" active={sortCol} dir={sortDir} />
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04] max-h-[540px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-white/20 text-xs">Sin conversaciones</div>
          ) : (
            filtered.map((row, i) => (
              <button
                key={row.id}
                onClick={() => setSelected(row)}
                className="w-full grid grid-cols-[28px_92px_1fr_76px_88px_72px_68px] items-center hover:bg-white/[0.04] transition-colors group"
              >
                <span className="px-2 py-2.5 text-[10px] text-white/15 text-center tabular-nums">{i + 1}</span>
                <span className="px-3 py-2.5 text-[10px] font-mono text-violet-400/50 truncate group-hover:text-violet-400/70 transition-colors">
                  {convId(row.run_id, row.started_at)}
                </span>
                <span className="px-3 py-2.5 text-xs text-white/65 truncate group-hover:text-white/80 transition-colors text-left">
                  {row.prompt}
                </span>
                <span className="px-2 py-2.5 flex items-center justify-center">
                  <StatusBadge status={row.status} />
                </span>
                <span className="px-2 py-2.5">
                  <span className="text-[9px] bg-blue-500/10 text-blue-400/60 border border-blue-500/15 rounded px-1.5 py-0.5 font-medium truncate block max-w-full">
                    {row.agent_name ?? 'Agent'}
                  </span>
                </span>
                <span className="px-2 py-2.5 text-[10px] text-white/25 text-center tabular-nums font-mono">
                  {duration(row.started_at, row.ended_at)}
                </span>
                <span className="px-2 py-2.5 text-[10px] text-white/25 text-center tabular-nums">
                  {rel(row.started_at)}
                </span>
              </button>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-3 py-2 border-t border-white/[0.04] bg-white/[0.015] flex items-center justify-between">
            <span className="text-[9px] text-white/15">
              {filtered.filter((r) => r.status === 'done').length} completadas en vista actual
            </span>
            <span className="text-[9px] text-white/15">↵ click en fila para abrir</span>
          </div>
        )}
      </div>

      {selected && <RecordModal row={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
