import { useState, useCallback, useEffect, RefObject } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string
  base64: string
}

interface UseImageUploadOptions {
  maxImages?: number
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
}

interface UseImageUploadReturn {
  images: UploadedImage[]
  isProcessing: boolean
  hasImages: boolean
  addImages: (fileList: FileList) => Promise<void>
  removeImage: (id: string) => void
  clearImages: () => void
  getBase64Images: () => string[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_MAX_IMAGES = 3

export function useImageUpload({
  maxImages = DEFAULT_MAX_IMAGES,
  inputRef,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.preview)
      })
    }
  }, [images])

  // Convertir File a base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  // Validar archivo
  const validateFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      console.warn(`Archivo rechazado: ${file.name} no es una imagen`)
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      console.warn(`Archivo rechazado: ${file.name} excede el tamaño máximo de 10MB`)
      return false
    }

    return true
  }, [])

  // Procesar archivos
  const processFiles = useCallback(
    async (files: File[]) => {
      setIsProcessing(true)

      try {
        const validFiles = files.filter(validateFile)

        if (validFiles.length === 0) {
          setIsProcessing(false)
          return
        }

        // Calcular cuántos archivos podemos agregar
        const availableSlots = maxImages - images.length
        const filesToProcess = validFiles.slice(0, availableSlots)

        if (filesToProcess.length < validFiles.length) {
          console.warn(
            `Solo se pueden agregar ${availableSlots} imágenes más (máximo: ${maxImages})`
          )
        }

        const newImages: UploadedImage[] = await Promise.all(
          filesToProcess.map(async (file) => {
            const preview = URL.createObjectURL(file)
            const base64 = await fileToBase64(file)

            return {
              id: crypto.randomUUID(),
              file,
              preview,
              base64,
            }
          })
        )

        setImages((prev) => [...prev, ...newImages])
      } catch (error) {
        console.error('Error procesando imágenes:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [images.length, maxImages, validateFile, fileToBase64]
  )

  // Agregar imágenes desde FileList (input file)
  const addImages = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList)
      await processFiles(files)
    },
    [processFiles]
  )

  // Remover imagen por ID
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)

      if (imageToRemove) {
        // Limpiar URL de memoria
        URL.revokeObjectURL(imageToRemove.preview)
      }

      return prev.filter((img) => img.id !== id)
    })
  }, [])

  // Limpiar todas las imágenes
  const clearImages = useCallback(() => {
    // Limpiar todas las URLs de memoria
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview)
    })
    setImages([])
  }, [images])

  // Obtener array de base64
  const getBase64Images = useCallback((): string[] => {
    return images.map((img) => img.base64)
  }, [images])

  // Manejador de paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items

      if (!items) return

      const files: File[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            files.push(file)
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault()
        await processFiles(files)
      }
    }

    // Escuchar globalmente en document para capturar paste de imágenes
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [processFiles])

  return {
    images,
    isProcessing,
    hasImages: images.length > 0,
    addImages,
    removeImage,
    clearImages,
    getBase64Images,
  }
}
