'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPages, createNewPage, deletePage } from '../services/draw-service'
import type { DrawPage } from '../types'
import { PenLine, Plus, Trash2 } from 'lucide-react'

export function DrawPages() {
  const router = useRouter()
  const [pages, setPages] = useState<DrawPage[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        const data = await getPages(user.id)
        setPages(data)
      } catch (err) {
        console.error('Failed to load pages:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const page = await createNewPage()
      router.push(`/draw/${page.page_id}`)
    } catch (err) {
      console.error('Failed to create page:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (pageId: string) => {
    try {
      await deletePage(pageId)
      setPages((prev) => prev.filter((p) => p.page_id !== pageId))
    } catch (err) {
      console.error('Failed to delete page:', err)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PenLine size={20} className="text-white/60" />
          <h1 className="text-lg font-semibold text-white/90">Draw</h1>
          <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full">
            {pages.length} pages
          </span>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          {creating ? 'Creating...' : 'New Page'}
        </button>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20">
          <PenLine size={40} className="mx-auto text-white/10 mb-4" />
          <p className="text-sm text-white/40 mb-4">No drawings yet</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white transition-colors"
          >
            Create your first drawing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages.map((page) => (
            <div
              key={page.page_id}
              onClick={() => router.push(`/draw/${page.page_id}`)}
              className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer"
            >
              <h3 className="text-sm font-medium text-white/70 group-hover:text-white/90 truncate">
                {page.name}
              </h3>
              <p className="text-[11px] text-white/30 mt-1">
                {formatDate(page.updated_at)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(page.page_id)
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
