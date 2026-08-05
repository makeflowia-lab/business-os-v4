'use client'
import { memo, useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
  Copy, Check, GitBranch, Loader2, AlertTriangle,
} from 'lucide-react'

// ─── Mermaid render hook ──────────────────────────────────────────────────────

function useMermaidRender(code: string) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const lastCode = useRef('')

  useEffect(() => {
    const trimmed = code.trim()
    if (!trimmed || lastCode.current === trimmed) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const timer = setTimeout(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          logLevel: 'fatal',
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: '#7c3aed',
            primaryTextColor: '#f1f5f9',
            primaryBorderColor: '#6d28d9',
            lineColor: '#8b5cf6',
            secondaryColor: '#1e1b4b',
            tertiaryColor: '#0f0f14',
            background: 'transparent',
            mainBkg: '#18181f',
            nodeBorder: '#6d28d9',
            clusterBkg: '#1a1a2e',
            titleColor: '#e2e8f0',
            edgeLabelBackground: '#1e1b4b',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          },
        })

        const clean = trimmed
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<\/?b>/gi, '')

        const id = `mc-mermaid-${Math.random().toString(36).slice(2, 9)}`
        const { svg: rendered } = await mermaid.render(id, clean)

        setSvg(rendered)
        lastCode.current = trimmed
      } catch (e) {
        setError(e instanceof Error ? e.message.slice(0, 120) : 'Syntax error')
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [code])

  return { svg, error, loading }
}

// ─── Zoom / pan hook ──────────────────────────────────────────────────────────

function useZoom() {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.85 : 1.18
    setScale(s => Math.min(Math.max(s * delta, 0.25), 6))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (scaleRef.current <= 1) return
    e.preventDefault()
    dragging.current = true
    origin.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    setPos({ x: e.clientX - origin.current.x, y: e.clientY - origin.current.y })
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const reset = useCallback(() => { setScale(1); setPos({ x: 0, y: 0 }) }, [])
  const zoomIn = useCallback(() => setScale(s => Math.min(s * 1.25, 6)), [])
  const zoomOut = useCallback(() => setScale(s => Math.max(s * 0.8, 0.25)), [])
  const setScaleTo = useCallback((v: number) => setScale(Math.min(Math.max(v, 0.25), 6)), [])

  return { scale, pos, onWheel, onMouseDown, onMouseMove, onMouseUp, reset, zoomIn, zoomOut, setScaleTo }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1 text-[10px] transition-colors ${className}`}
    >
      {copied
        ? <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copiado</span></>
        : <><Copy size={11} /><span>Copiar</span></>
      }
    </button>
  )
}



// ─── Fullscreen modal ─────────────────────────────────────────────────────────

interface FullscreenProps {
  code: string
  svg: string
  onClose: () => void
}

function FullscreenModal({ code, svg, onClose }: FullscreenProps) {
  const zoom = useZoom()
  const wrapRef = useRef<HTMLDivElement>(null)
  const pinchRef = useRef<{ dist: number; initScale: number } | null>(null)

  // Wheel zoom (desktop)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const h = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) zoom.zoomOut()
      else zoom.zoomIn()
    }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom.zoomIn, zoom.zoomOut])

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Touch pinch-to-zoom handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy), initScale: zoom.scale }
    }
  }, [zoom.scale])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return
    e.preventDefault()
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.hypot(dx, dy)
    zoom.setScaleTo(pinchRef.current.initScale * (dist / pinchRef.current.dist))
  }, [zoom])

  const onTouchEnd = useCallback(() => { pinchRef.current = null }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Header — with top safe area so it doesn't overlap status bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 text-white/50">
          <GitBranch size={14} className="text-violet-400" />
          <span className="text-xs font-medium">Diagrama Mermaid</span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton code={code} className="text-white/30 hover:text-white/60" />
          <div className="flex items-center gap-0.5 mx-2">
            <button onClick={zoom.zoomOut} className="p-2 md:p-1.5 rounded hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"><ZoomOut size={15} /></button>
            <span className="text-[10px] text-white/25 w-10 text-center font-mono">{Math.round(zoom.scale * 100)}%</span>
            <button onClick={zoom.zoomIn} className="p-2 md:p-1.5 rounded hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"><ZoomIn size={15} /></button>
            <button onClick={zoom.reset} className="p-2 md:p-1.5 rounded hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors" title="Reset zoom"><RotateCcw size={13} /></button>
          </div>
          <button
            onClick={onClose}
            className="p-2 md:p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white transition-colors"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>

      {/* Canvas — touch-action none enables our custom pinch handler */}
      <div
        ref={wrapRef}
        className="flex-1 overflow-hidden flex items-center justify-center"
        style={{ cursor: zoom.scale > 1 ? 'grab' : 'default', touchAction: 'none' }}
        onMouseDown={zoom.onMouseDown}
        onMouseMove={zoom.onMouseMove}
        onMouseUp={zoom.onMouseUp}
        onMouseLeave={zoom.onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            transform: `scale(${zoom.scale}) translate(${zoom.pos.x / zoom.scale}px, ${zoom.pos.y / zoom.scale}px)`,
            transformOrigin: 'center center',
            transition: zoom.scale === 1 ? 'transform 0.2s ease' : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {/* Footer hint — with bottom safe area */}
      <div
        className="shrink-0 py-2 text-center text-[10px] text-white/20 bg-black/40"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        Pellizca para zoom · Arrastra para mover · ESC para cerrar
      </div>
    </div>,
    document.body,
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const MermaidDiagram = memo(function MermaidDiagram({ code }: { code: string }) {
  const { svg, error, loading } = useMermaidRender(code)
  const zoom = useZoom()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // Attach wheel to container
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const h = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) zoom.zoomOut()
      else zoom.zoomIn()
    }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom.zoomIn, zoom.zoomOut])

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-white/40">
          <GitBranch size={12} className="text-violet-400/70" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">Mermaid</span>
        </div>
        <div className="flex items-center gap-1">
          {svg && (
            <>
              <button onClick={zoom.zoomOut} disabled={zoom.scale <= 0.25} className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-colors disabled:opacity-30"><ZoomOut size={11} /></button>
              <span className="text-[10px] text-white/20 w-8 text-center font-mono">{Math.round(zoom.scale * 100)}%</span>
              <button onClick={zoom.zoomIn} disabled={zoom.scale >= 6} className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-colors disabled:opacity-30"><ZoomIn size={11} /></button>
              {zoom.scale !== 1 && (
                <button onClick={zoom.reset} className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-colors" title="Reset"><RotateCcw size={10} /></button>
              )}
              <div className="w-px h-3 bg-white/[0.08] mx-1" />
              <CopyButton code={code} className="text-white/25 hover:text-white/60" />
              <div className="w-px h-3 bg-white/[0.08] mx-1" />
              <button onClick={() => setFullscreen(true)} className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-colors" title="Pantalla completa"><Maximize2 size={11} /></button>
            </>
          )}
        </div>
      </div>

      {/* Diagram area */}
      <div
        ref={wrapRef}
        className="h-[300px] overflow-hidden flex items-center justify-center bg-white/[0.01]"
        style={{ cursor: svg ? (zoom.scale > 1 ? 'grab' : 'default') : 'default' }}
        onMouseDown={zoom.onMouseDown}
        onMouseMove={zoom.onMouseMove}
        onMouseUp={zoom.onMouseUp}
        onMouseLeave={zoom.onMouseUp}
        onDoubleClick={zoom.reset}
      >
        {loading && (
          <div className="flex items-center gap-2 text-white/30">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Renderizando diagrama…</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <AlertTriangle size={16} className="text-amber-400/60" />
            <p className="text-[11px] text-white/30">Error de sintaxis en el diagrama</p>
            <pre className="text-[10px] text-red-400/50 font-mono max-w-xs overflow-auto">{error}</pre>
          </div>
        )}

        {svg && !loading && (
          <div
            style={{
              transform: `scale(${zoom.scale}) translate(${zoom.pos.x / zoom.scale}px, ${zoom.pos.y / zoom.scale}px)`,
              transformOrigin: 'center center',
              transition: zoom.scale === 1 && zoom.pos.x === 0 ? 'transform 0.2s ease' : undefined,
              maxWidth: '100%',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>

      {/* Hint */}
      {svg && (
        <div className="px-3.5 py-1.5 border-t border-white/[0.04] text-[9px] text-white/15 flex items-center gap-3">
          <span>Scroll = zoom</span>
          <span>·</span>
          <span>Arrastra = mover</span>
          <span>·</span>
          <span>Doble click = reset</span>
        </div>
      )}

      {fullscreen && svg && (
        <FullscreenModal code={code} svg={svg} onClose={() => setFullscreen(false)} />
      )}
    </div>
  )
})
