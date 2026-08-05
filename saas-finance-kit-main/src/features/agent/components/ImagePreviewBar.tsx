import { X } from 'lucide-react'

interface ImagePreview {
  id: string
  preview: string
}

interface Props {
  images: ImagePreview[]
  onRemove: (id: string) => void
  disabled?: boolean
}

export function ImagePreviewBar({ images, onRemove, disabled = false }: Props) {
  if (images.length === 0) return null

  return (
    <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <div className="flex gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative w-12 h-12 rounded-lg overflow-hidden shadow-neu-sm group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={() => onRemove(image.id)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                aria-label="Eliminar imagen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
      <span className="ml-auto text-sm text-gray-500">
        {images.length}/3 {images.length === 1 ? 'imagen' : 'imagenes'}
      </span>
    </div>
  )
}
