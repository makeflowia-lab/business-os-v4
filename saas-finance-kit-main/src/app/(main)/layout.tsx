import { NavBar } from '@/shared/components/ui/NavBar'
import { AgentSidebarProvider } from '@/shared/context/AgentSidebarContext'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AgentSidebarProvider>
      <div className="h-screen bg-neu-bg flex flex-col overflow-hidden">
        <NavBar />
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </div>
    </AgentSidebarProvider>
  )
}
