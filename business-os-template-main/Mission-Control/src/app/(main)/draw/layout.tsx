'use client'

import { DrawSidebar } from '@/features/draw/components/DrawSidebar'
import { useLayoutStore } from '@/shared/stores/layout-store'

export default function DrawLayout({ children }: { children: React.ReactNode }) {
  const drawSidebarOpen = useLayoutStore((s) => s.drawSidebarOpen)
  const closeDrawSidebar = useLayoutStore((s) => s.closeDrawSidebar)
  const drawFullscreen = useLayoutStore((s) => s.drawFullscreen)

  if (drawFullscreen) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        <div className="flex-1 min-w-0 h-full">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          ${drawSidebarOpen ? 'translate-x-0 md:w-64' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
          fixed md:relative z-20 md:z-0
          w-64 h-full shrink-0
          bg-[#0a0a0f] md:bg-transparent
          transition-all duration-300 ease-in-out
        `}
      >
        <DrawSidebar />
      </div>

      {/* Mobile backdrop */}
      {drawSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={closeDrawSidebar}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 h-full">
        {children}
      </div>
    </div>
  )
}
