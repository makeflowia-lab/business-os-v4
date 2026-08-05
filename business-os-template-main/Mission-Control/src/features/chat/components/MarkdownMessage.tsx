'use client'
import { useRef, useState, useCallback, useEffect, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check, X, ZoomIn } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
import { MermaidDiagram } from './MermaidDiagram'

// ─── Code block with copy button ─────────────────────────────────────────────

function CodeBlock({ className, children }: ComponentPropsWithoutRef<'code'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const isBlock = /language-|hljs/.test(className ?? '')

  if (!isBlock) {
    return (
      <code className="bg-white/[0.08] border border-white/[0.08] px-1.5 py-0.5 rounded text-[0.8em] font-mono text-violet-300 break-all">
        {children}
      </code>
    )
  }

  if (/language-mermaid/.test(className ?? '')) {
    const code = String(children).replace(/\n$/, '')
    return <MermaidDiagram code={code} />
  }

  const language = (className ?? '').replace(/language-|hljs/g, '').trim()

  const handleCopy = () => {
    const text = preRef.current?.innerText ?? ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.04]">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/70 transition-colors"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto px-4 py-3 text-xs leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}

// ─── Pinch-to-zoom lightbox ──────────────────────────────────────────────────

export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const lastTouchRef = useRef<{ dist: number; x: number; y: number; scale: number; tx: number; ty: number } | null>(null)
  const lastTapRef = useRef(0)
  const imgRef = useRef<HTMLDivElement>(null)

  // Reset on mount
  useEffect(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [src])

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const getTouchDist = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

  const getTouchCenter = (t1: React.Touch, t2: React.Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getTouchDist(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])
      lastTouchRef.current = { dist, x: center.x, y: center.y, scale, tx: translate.x, ty: translate.y }
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = { dist: 0, x: e.touches[0].clientX, y: e.touches[0].clientY, scale, tx: translate.x, ty: translate.y }
    }
  }, [scale, translate])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!lastTouchRef.current) return

    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getTouchDist(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])
      const ratio = dist / lastTouchRef.current.dist
      const newScale = Math.min(Math.max(lastTouchRef.current.scale * ratio, 1), 5)

      const dx = center.x - lastTouchRef.current.x
      const dy = center.y - lastTouchRef.current.y

      setScale(newScale)
      setTranslate({
        x: lastTouchRef.current.tx + dx,
        y: lastTouchRef.current.ty + dy,
      })
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x
      const dy = e.touches[0].clientY - lastTouchRef.current.y
      setTranslate({
        x: lastTouchRef.current.tx + dx,
        y: lastTouchRef.current.ty + dy,
      })
    }
  }, [scale])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      lastTouchRef.current = null

      if (scale <= 1.05) {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
      }
    }

    // Double-tap to zoom
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          setScale(1)
          setTranslate({ x: 0, y: 0 })
        } else {
          setScale(2.5)
          const rect = imgRef.current?.getBoundingClientRect()
          if (rect) {
            const tapX = e.changedTouches[0].clientX
            const tapY = e.changedTouches[0].clientY
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            setTranslate({
              x: (centerX - tapX) * 1.5,
              y: (centerY - tapY) * 1.5,
            })
          }
        }
      }
      lastTapRef.current = now
    }
  }, [scale])

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.min(Math.max(scale * delta, 1), 5)
    if (newScale === 1) setTranslate({ x: 0, y: 0 })
    setScale(newScale)
  }, [scale])

  const handleBackdropClick = useCallback(() => {
    if (scale <= 1.05) onClose()
  }, [scale, onClose])

  const isZoomed = scale > 1.05

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all active:scale-90"
      >
        <X size={18} />
      </button>

      {/* Zoom hint */}
      {!isZoomed && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/50 text-[10px] pointer-events-none select-none">
          <ZoomIn size={12} />
          <span className="hidden md:inline">Scroll to zoom</span>
          <span className="md:hidden">Pinch to zoom</span>
        </div>
      )}

      {/* Image container */}
      <div
        ref={imgRef}
        className="w-full h-full flex items-center justify-center"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="select-none"
          style={{
            maxWidth: '92vw',
            maxHeight: '88vh',
            objectFit: 'contain',
            borderRadius: '12px',
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: isZoomed ? 'none' : 'transform 0.2s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

// ─── Inline image with lightbox ──────────────────────────────────────────────

const ChatImage = memo(function ChatImage({ src, alt }: { src?: string; alt?: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || error) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/25 text-xs">
        <ZoomIn size={12} />
        {error ? 'Image unavailable' : 'No image'}
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group block my-2.5 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-violet-400/30 transition-all duration-300 cursor-zoom-in relative shadow-lg shadow-black/20"
      >
        {/* Loading skeleton */}
        {!loaded && (
          <div className="w-full h-40 bg-white/[0.04] animate-pulse rounded-2xl" />
        )}
        <img
          src={src}
          alt={alt ?? 'image'}
          className={`max-w-full h-auto max-h-[300px] object-contain transition-all duration-300 group-hover:scale-[1.02] ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
        {/* Hover overlay with zoom icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2.5">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white/80 text-[10px]">
            <ZoomIn size={10} />
            Enlarge
          </span>
        </div>
      </button>

      {open && <ImageLightbox src={src} alt={alt ?? 'image'} onClose={() => setOpen(false)} />}
    </>
  )
}, (prev, next) => prev.src === next.src && prev.alt === next.alt)

// ─── Main component ───────────────────────────────────────────────────────────

export const MarkdownMessage = memo(function MarkdownMessage({ content }: { content: string }) {
  // Strip internal markers (skill loading, system tags) that shouldn't be visible
  const cleaned = content
    .replace(/<details>[\s\S]*?<\/details>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!cleaned) return null

  return (
    <div className="markdown-message text-sm leading-normal min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: CodeBlock,
          p: ({ children }) => (
            <p className="mb-1 last:mb-0 whitespace-pre-wrap break-words">{children}</p>
          ),
          h1: ({ children }) => <h1 className="text-base font-bold text-white mt-2.5 mb-1 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold text-white mt-2.5 mb-0.5 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold text-white/80 mt-2 mb-0.5 first:mt-0">{children}</h3>,
          ul: ({ children }) => <ul className="mb-1 pl-4 space-y-px list-disc list-outside">{children}</ul>,
          ol: ({ children }) => <ol className="mb-1 pl-4 space-y-px list-decimal list-outside">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-normal">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-1.5 pl-3 border-l-2 border-violet-400/40 text-white/60 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-2 border-white/[0.08]" />,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="text-white/70 italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => <ChatImage src={typeof src === 'string' ? src : undefined} alt={typeof alt === 'string' ? alt : undefined} />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="min-w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-white/60 border-b border-white/[0.08] bg-white/[0.04]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-white/[0.04] text-white/80">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
