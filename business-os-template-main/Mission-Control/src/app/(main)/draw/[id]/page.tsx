'use client'

import { use } from 'react'
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'
import { ExcalidrawEditor } from '@/features/draw/components/excalidraw-editor'

const ExcalidrawComponent = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  { ssr: false },
)

export default function DrawEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="h-full w-full">
      <ExcalidrawEditor pageId={id} ExcalidrawComponent={ExcalidrawComponent} />
    </div>
  )
}
