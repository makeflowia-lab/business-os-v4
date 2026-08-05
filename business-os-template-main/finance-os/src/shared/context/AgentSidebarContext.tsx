'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface AgentSidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const AgentSidebarContext = createContext<AgentSidebarContextType | null>(null)

export function AgentSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AgentSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AgentSidebarContext.Provider>
  )
}

export function useAgentSidebar() {
  const context = useContext(AgentSidebarContext)
  if (!context) {
    // Return default values if not in provider (for non-agent pages)
    return { isOpen: false, setIsOpen: () => {} }
  }
  return context
}
