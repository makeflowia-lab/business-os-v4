'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Clock,
} from 'lucide-react'
import type { AgentSession } from '../services/historyService'

interface AgentSidebarProps {
  sessions: AgentSession[]
  currentSessionId: string | null
  isLoading: boolean
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  // Control externo opcional
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AgentSidebar({
  sessions,
  currentSessionId,
  isLoading,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen: externalIsOpen,
  onOpenChange,
}: AgentSidebarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Usar estado externo si se provee, sino interno
  const isOpen = externalIsOpen ?? internalIsOpen
  const setIsOpen = onOpenChange ?? setInternalIsOpen
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const handleDelete = (sessionId: string) => {
    if (deleteConfirm === sessionId) {
      onDeleteSession(sessionId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(sessionId)
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Drawer only */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          w-72 bg-neu-bg border-r border-gray-200/50
          flex flex-col
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header con Logo */}
        <div className="p-4 border-b border-gray-200/50">
          {/* Logo + Close */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo2.png"
                alt="Finanzas OS"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span className="font-bold text-gray-800">Finanzas OS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Session Button */}
          <button
            onClick={() => {
              onNewSession()
              setIsOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neu-bg shadow-neu rounded-xl text-blue-600 font-medium text-sm hover:shadow-neu-inset transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva conversacion
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Sin conversaciones</p>
              <p className="text-xs text-gray-400 mt-1">
                Inicia una nueva para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isSelected = currentSessionId === session.id
                const isDeleting = deleteConfirm === session.id

                return (
                  <div
                    key={session.id}
                    className={`
                      group relative rounded-xl transition-all cursor-pointer
                      ${isSelected
                        ? 'bg-blue-50 shadow-neu-inset'
                        : 'bg-neu-bg shadow-neu hover:shadow-neu-sm'
                      }
                    `}
                    onClick={() => {
                      onSelectSession(session.id)
                      setIsOpen(false)
                    }}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            {session.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatDate(session.updated_at)}
                            </span>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs text-gray-400">
                              {session.model}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(session.id)
                          }}
                          className={`
                            flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                            transition-all opacity-0 group-hover:opacity-100
                            ${isDeleting
                              ? 'bg-red-500 text-white'
                              : 'bg-neu-bg shadow-neu text-gray-400 hover:text-red-500'
                            }
                          `}
                          title={isDeleting ? 'Confirmar eliminar' : 'Eliminar'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-400 text-center">
            {sessions.length} sesiones guardadas
          </p>
        </div>
      </aside>
    </>
  )
}
