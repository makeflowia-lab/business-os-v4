'use client'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  src: string
  alt: string
  onClose: () => void
}

export function AvatarLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/[0.1] border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.2] transition-all"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <X size={18} />
      </button>

      {/* Image */}
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-3">
        <img
          src={src}
          alt={alt}
          className="w-72 h-72 rounded-3xl object-cover border-2 border-violet-400/40 shadow-[0_0_60px_rgba(124,58,237,0.4)]"
        />
        <p className="text-xs text-white/30 font-medium tracking-wide">{alt}</p>
      </div>
    </div>,
    document.body,
  )
}
