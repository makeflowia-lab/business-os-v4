'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  PenLine, Plus, Clock, MoreHorizontal, Star, Pencil, Trash2,
  FolderPlus, ChevronRight, ChevronDown, FolderOpen, Folder, ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import {
  getPages, createNewPage, deletePage, renamePage, movePageToFolder,
  getFolders, createFolder, renameFolder, deleteFolder,
} from '../services/draw-service'
import { useDrawStore } from '../stores/draw-store'
import { useLayoutStore } from '@/shared/stores/layout-store'
import type { DrawPage, DrawFolder } from '../types'

export function DrawSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const activePageId = pathname.startsWith('/draw/') ? pathname.split('/')[2] : null

  const [pages, setPages] = useState<DrawPage[]>([])
  const [folders, setFolders] = useState<DrawFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const [dragOverRoot, setDragOverRoot] = useState(false)

  const favorites = useDrawStore((s) => s.favorites ?? [])
  const setLastPageId = useDrawStore((s) => s.setLastPageId)
  const toggleFavorite = useDrawStore((s) => s.toggleFavorite)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      try {
        const [pagesData, foldersData] = await Promise.all([
          getPages(user.id),
          getFolders(user.id),
        ])
        setPages(pagesData)
        setFolders(foldersData)
      } catch (err) {
        console.error('Failed to load draw data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sortPages = useCallback((list: DrawPage[]) => {
    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.page_id)
      const bFav = favorites.includes(b.page_id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [favorites])

  const loosePages = sortPages(pages.filter((p) => !p.folder_id))
  const pagesByFolder = (folderId: string) =>
    sortPages(pages.filter((p) => p.folder_id === folderId))

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const handleCreatePage = async () => {
    if (creating) return
    setCreating(true)
    try {
      const page = await createNewPage()
      setPages((prev) => [page, ...prev])
      setLastPageId(page.page_id)
      router.push(`/draw/${page.page_id}`)
      if (window.innerWidth < 768) useLayoutStore.getState().closeDrawSidebar()
    } catch (err) {
      console.error('Failed to create page:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateFolder = async () => {
    try {
      const folder = await createFolder()
      setFolders((prev) => [...prev, folder])
    } catch (err) {
      console.error('Failed to create folder:', err)
    }
  }

  const handleDeletePage = (pageId: string) => {
    deletePage(pageId).catch(console.error)
    const remaining = pages.filter((p) => p.page_id !== pageId)
    setPages(remaining)

    if (useDrawStore.getState().lastPageId === pageId) {
      setLastPageId(null)
    }

    if (activePageId === pageId) {
      if (remaining.length > 0) {
        setLastPageId(remaining[0].page_id)
        router.push(`/draw/${remaining[0].page_id}`)
      } else {
        router.push('/draw')
      }
    }
  }

  const handleRenamePage = (pageId: string, newName: string) => {
    renamePage(pageId, newName).catch(console.error)
    setPages((prev) =>
      prev.map((p) =>
        p.page_id === pageId
          ? { ...p, name: newName, updated_at: new Date().toISOString() }
          : p,
      ),
    )
    const cache = useDrawStore.getState().cache[pageId]
    if (cache) {
      useDrawStore.getState().setPageCache(pageId, {
        ...cache,
        name: newName,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const handleMovePage = (pageId: string, folderId: string | null) => {
    movePageToFolder(pageId, folderId).catch(console.error)
    setPages((prev) =>
      prev.map((p) =>
        p.page_id === pageId ? { ...p, folder_id: folderId } : p,
      ),
    )
  }

  const handleRenameFolder = (folderId: string, newName: string) => {
    renameFolder(folderId, newName).catch(console.error)
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, name: newName } : f,
      ),
    )
  }

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId).catch(console.error)
    setPages((prev) =>
      prev.map((p) =>
        p.folder_id === folderId ? { ...p, folder_id: null } : p,
      ),
    )
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
  }

  const handleSelectPage = (page: DrawPage) => {
    setLastPageId(page.page_id)
    router.push(`/draw/${page.page_id}`)
    if (window.innerWidth < 768) useLayoutStore.getState().closeDrawSidebar()
  }

  return (
    <div className="flex flex-col h-full border-r border-white/[0.06]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
          Drawings
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCreateFolder}
            title="New folder"
            className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            <FolderPlus size={13} />
          </button>
          <button
            onClick={handleCreatePage}
            disabled={creating}
            title="New drawing"
            className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1.5">
        {loading ? (
          <div className="space-y-1.5 px-2 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : pages.length === 0 && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-3 py-8 text-center">
            <PenLine size={20} className="text-white/15" />
            <p className="text-[11px] text-white/25">No drawings</p>
          </div>
        ) : (
          <>
            {/* Folders */}
            {folders.map((folder) => {
              const isCollapsed = collapsedFolders.has(folder.id)
              const folderPages = pagesByFolder(folder.id)
              return (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  pages={folderPages}
                  isCollapsed={isCollapsed}
                  activePageId={activePageId}
                  favorites={favorites}
                  allFolders={folders}
                  isDragOver={dragOverFolderId === folder.id}
                  onToggle={() => toggleFolder(folder.id)}
                  onSelectPage={handleSelectPage}
                  onDeletePage={handleDeletePage}
                  onRenamePage={handleRenamePage}
                  onToggleFavorite={toggleFavorite}
                  onMovePage={handleMovePage}
                  onRenameFolder={(name) => handleRenameFolder(folder.id, name)}
                  onDeleteFolder={() => handleDeleteFolder(folder.id)}
                  onDragOver={() => setDragOverFolderId(folder.id)}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(pageId) => {
                    setDragOverFolderId(null)
                    handleMovePage(pageId, folder.id)
                  }}
                />
              )
            })}

            {folders.length > 0 && loosePages.length > 0 && (
              <div className="h-px bg-white/[0.04] mx-3 my-1.5" />
            )}

            {/* Loose pages (no folder) */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverRoot(true) }}
              onDragLeave={() => setDragOverRoot(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverRoot(false)
                const pageId = e.dataTransfer.getData('text/page-id')
                if (pageId) handleMovePage(pageId, null)
              }}
              className={`transition-colors rounded-lg ${dragOverRoot ? 'bg-violet-500/10 ring-1 ring-violet-500/30' : ''}`}
            >
            {loosePages.map((page) => (
              <DrawSidebarItem
                key={page.page_id}
                page={page}
                active={activePageId === page.page_id}
                isFavorite={favorites.includes(page.page_id)}
                folders={folders}
                onSelect={() => handleSelectPage(page)}
                onDelete={() => handleDeletePage(page.page_id)}
                onToggleFavorite={() => toggleFavorite(page.page_id)}
                onRename={(name) => handleRenamePage(page.page_id, name)}
                onMoveTo={(folderId) => handleMovePage(page.page_id, folderId)}
              />
            ))}
            {loosePages.length === 0 && folders.length > 0 && (
              <p className="text-[10px] text-white/15 px-4 py-2">Drag here to remove from folder</p>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Folder item ──────────────────────────────────────────────────────────────

function FolderItem({
  folder, pages, isCollapsed, activePageId, favorites, allFolders, isDragOver,
  onToggle, onSelectPage, onDeletePage, onRenamePage, onToggleFavorite, onMovePage,
  onRenameFolder, onDeleteFolder, onDragOver, onDragLeave, onDrop,
}: {
  folder: DrawFolder; pages: DrawPage[]; isCollapsed: boolean; activePageId: string | null
  favorites: string[]; allFolders: DrawFolder[]; isDragOver: boolean
  onToggle: () => void; onSelectPage: (page: DrawPage) => void
  onDeletePage: (pageId: string) => void; onRenamePage: (pageId: string, name: string) => void
  onToggleFavorite: (pageId: string) => void; onMovePage: (pageId: string, folderId: string | null) => void
  onRenameFolder: (name: string) => void; onDeleteFolder: () => void
  onDragOver: () => void; onDragLeave: () => void; onDrop: (pageId: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(folder.name)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    if (editing) {
      setEditValue(folder.name)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, folder.name])

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== folder.name) onRenameFolder(trimmed)
    setEditing(false)
  }

  return (
    <div className="mb-0.5">
      <div
        className={`group relative mx-1.5 rounded-lg transition-all
          ${isDragOver ? 'bg-violet-500/10 ring-1 ring-violet-500/30' : 'hover:bg-white/[0.04]'}`}
        onDragOver={(e) => { e.preventDefault(); onDragOver() }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault()
          const pageId = e.dataTransfer.getData('text/page-id')
          if (pageId) onDrop(pageId)
        }}
      >
        <div
          onClick={() => !editing && onToggle()}
          className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer pr-8"
        >
          {isCollapsed ? <ChevronRight size={12} className="text-white/25 shrink-0" /> : <ChevronDown size={12} className="text-white/25 shrink-0" />}
          {isCollapsed ? <Folder size={13} className="text-white/30 shrink-0" /> : <FolderOpen size={13} className="text-white/40 shrink-0" />}

          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              onBlur={commitRename}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white/[0.06] border border-violet-500/40 rounded px-1.5 py-0.5 text-xs text-white outline-none"
            />
          ) : (
            <span className="text-xs font-medium text-white/50 truncate">{folder.name}</span>
          )}

          {!editing && <span className="text-[9px] text-white/20 ml-auto mr-5">{pages.length}</span>}
        </div>

        {!editing && (
          <div className="absolute top-1.5 right-1.5" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
              className={`p-1 rounded transition-colors ${menuOpen ? 'bg-white/[0.1] text-white/60' : 'text-white/0 group-hover:text-white/30 hover:!text-white/60 hover:bg-white/[0.08]'}`}
            >
              <MoreHorizontal size={12} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-white/[0.08] bg-[#111118] shadow-xl shadow-black/40 overflow-hidden">
                <button onClick={() => { setMenuOpen(false); setEditing(true) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
                  <Pencil size={12} /> Rename
                </button>
                <div className="h-px bg-white/[0.06]" />
                <button onClick={() => { setMenuOpen(false); onDeleteFolder() }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  <Trash2 size={12} /> Delete folder
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="ml-3">
          {pages.length === 0 ? (
            <p className="text-[10px] text-white/15 px-4 py-1.5">Empty</p>
          ) : (
            pages.map((page) => (
              <DrawSidebarItem
                key={page.page_id}
                page={page}
                active={activePageId === page.page_id}
                isFavorite={favorites.includes(page.page_id)}
                folders={allFolders}
                currentFolderId={folder.id}
                onSelect={() => onSelectPage(page)}
                onDelete={() => onDeletePage(page.page_id)}
                onToggleFavorite={() => onToggleFavorite(page.page_id)}
                onRename={(name) => onRenamePage(page.page_id, name)}
                onMoveTo={(folderId) => onMovePage(page.page_id, folderId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar item (page) ────────────────────────────────────────────────────────

function DrawSidebarItem({
  page, active, isFavorite, folders, currentFolderId,
  onSelect, onDelete, onToggleFavorite, onRename, onMoveTo,
}: {
  page: DrawPage; active: boolean; isFavorite: boolean; folders: DrawFolder[]
  currentFolderId?: string; onSelect: () => void; onDelete: () => void
  onToggleFavorite: () => void; onRename: (name: string) => void
  onMoveTo: (folderId: string | null) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(page.name)
  const [moveOpen, setMoveOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const cachedName = useDrawStore((s) => s.cache[page.page_id]?.name)
  const displayName = cachedName || page.name

  const timeAgo = formatDistanceToNow(new Date(page.updated_at), { addSuffix: false })

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setMoveOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    if (editing) {
      setEditValue(displayName)
      setTimeout(() => inputRef.current?.select(), 0)
    }
  }, [editing, displayName])

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== displayName) onRename(trimmed)
    setEditing(false)
  }

  const moveTargets = folders.filter((f) => f.id !== currentFolderId)

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/page-id', page.page_id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className={`group relative mx-1.5 rounded-lg transition-all ${active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}
    >
      <div onClick={() => !editing && onSelect()} className="flex flex-col gap-0.5 px-2.5 py-2 cursor-pointer pr-8">
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white/[0.06] border border-violet-500/40 rounded px-1.5 py-0.5 text-xs text-white outline-none"
          />
        ) : (
          <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
            {displayName}
          </p>
        )}

        {!editing && (
          <div className="flex items-center gap-1 text-[10px] text-white/25">
            {isFavorite ? <Star size={9} className="text-amber-400/70 fill-amber-400/70 shrink-0" /> : <Clock size={9} className="shrink-0" />}
            <span className="truncate">{timeAgo}</span>
          </div>
        )}
      </div>

      {!editing && (
        <div className="absolute top-2 right-1.5" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); setMoveOpen(false) }}
            className={`p-1 rounded transition-colors ${menuOpen ? 'bg-white/[0.1] text-white/60' : 'text-white/0 group-hover:text-white/30 hover:!text-white/60 hover:bg-white/[0.08]'}`}
            title="Options"
          >
            <MoreHorizontal size={12} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-white/[0.08] bg-[#111118] shadow-xl shadow-black/40 overflow-hidden">
              <button onClick={() => { setMenuOpen(false); onToggleFavorite() }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
                <Star size={12} className={isFavorite ? 'text-amber-400 fill-amber-400' : ''} />
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button onClick={() => { setMenuOpen(false); setEditing(true) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
                <Pencil size={12} /> Rename
              </button>

              {(moveTargets.length > 0 || currentFolderId) && (
                <>
                  <div className="h-px bg-white/[0.06]" />
                  <button onClick={(e) => { e.stopPropagation(); setMoveOpen((v) => !v) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors">
                    <ArrowRight size={12} /> Move to...
                    <ChevronRight size={10} className="ml-auto" />
                  </button>
                  {moveOpen && (
                    <div className="border-t border-white/[0.06] bg-[#0d0d15]">
                      {currentFolderId && (
                        <button onClick={() => { setMenuOpen(false); setMoveOpen(false); onMoveTo(null) }} className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors">
                          <PenLine size={10} /> No folder
                        </button>
                      )}
                      {moveTargets.map((f) => (
                        <button key={f.id} onClick={() => { setMenuOpen(false); setMoveOpen(false); onMoveTo(f.id) }} className="w-full flex items-center gap-2 px-4 py-1.5 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors">
                          <Folder size={10} /> {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="h-px bg-white/[0.06]" />
              <button onClick={() => { setMenuOpen(false); onDelete() }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
