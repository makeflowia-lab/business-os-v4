'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDrawStore } from '@/features/draw/stores/draw-store'
import { useLayoutStore } from '@/shared/stores/layout-store'
import { PenLine } from 'lucide-react'

export default function DrawPage() {
  const router = useRouter()
  const lastPageId = useDrawStore((s) => s.lastPageId)

  // Ensure sidebar is open when landing on /draw
  useEffect(() => {
    const { drawSidebarOpen } = useLayoutStore.getState()
    if (!drawSidebarOpen) {
      useLayoutStore.getState().toggleDrawSidebar()
    }
  }, [])

  useEffect(() => {
    if (lastPageId) {
      router.replace(`/draw/${lastPageId}`)
    }
  }, [lastPageId, router])

  if (lastPageId) return null

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <PenLine size={40} className="text-white/10" />
      <p className="text-sm text-white/40">Select a drawing or create a new one</p>
    </div>
  )
}
