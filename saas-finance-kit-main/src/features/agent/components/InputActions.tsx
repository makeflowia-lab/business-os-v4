'use client'

import { useRef } from 'react'
import { Globe, ImagePlus } from 'lucide-react'

interface Props {
  webSearch: boolean
  onWebSearchToggle: () => void
  onImageSelect: (files: FileList) => void
  disabled?: boolean
  hasImages?: boolean
}

export function InputActions({
  webSearch,
  onWebSearchToggle,
  onImageSelect,
  disabled = false,
  hasImages = false,
}: Props) {
  // 1. Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 2. Handlers
  const handleImageClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onImageSelect(files)
      // Reset input value para permitir subir el mismo archivo de nuevo
      e.target.value = ''
    }
  }

  // 3. Renderizado
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload images"
      />

      {/* Web Search Toggle */}
      <button
        type="button"
        onClick={onWebSearchToggle}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50
          ${
            webSearch
              ? 'bg-blue-50 text-blue-600 shadow-neu-inset'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        aria-label="Toggle web search"
        aria-pressed={webSearch}
      >
        <Globe className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Web</span>
      </button>

      {/* Image Upload */}
      <button
        type="button"
        onClick={handleImageClick}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50
          ${
            hasImages
              ? 'bg-green-50 text-green-600 shadow-neu-inset'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        aria-label="Upload images"
        aria-pressed={hasImages}
      >
        <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Imagen</span>
      </button>

      {/* Keyboard Hint */}
      <span className="text-[10px] text-gray-300 ml-auto hidden sm:block">
        Cmd+V para pegar
      </span>
    </div>
  )
}
