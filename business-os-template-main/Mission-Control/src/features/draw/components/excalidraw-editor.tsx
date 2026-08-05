'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PanelLeft, Maximize2, Minimize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getDrawData, saveDrawData } from '../services/draw-service'
import { useDrawStore } from '../stores/draw-store'
import { useLayoutStore } from '@/shared/stores/layout-store'
import type { DrawElements } from '../types'

/** Ensure agent-generated elements have all fields Excalidraw expects */
function sanitizeElements(
  elems: Record<string, unknown>[],
): Record<string, unknown>[] {
  return elems.map((el) => {
    const base: Record<string, unknown> = {
      // Required arrays/objects
      groupIds: [],
      boundElements: null,
      link: null,
      locked: false,
      // Required numbers
      version: 1,
      versionNonce: Math.floor(Math.random() * 2147483647),
      seed: Math.floor(Math.random() * 2147483647),
      updated: Date.now(),
      // Required rendering fields
      isDeleted: false,
      fillStyle: 'solid',
      strokeStyle: 'solid',
      strokeWidth: 1,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      opacity: 100,
      roughness: 0,
      angle: 0,
      // Spread actual values on top (overrides defaults)
      ...el,
    }
    // roundness must be object or null, never a bare number
    if (typeof base.roundness === 'number') {
      base.roundness = { type: base.roundness }
    }
    base.roundness ??= null
    // version MUST be a number, never null
    if (base.version == null || typeof base.version !== 'number') {
      base.version = 1
    }
    // Text elements need extra fields
    if (base.type === 'text') {
      base.containerId ??= null
      base.lineHeight ??= 1.25
      base.textAlign ??= 'left'
      base.verticalAlign ??= 'top'
      base.originalText ??= base.text ?? ''
    }
    return base
  })
}
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { NonDeletedExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import type { BinaryFiles } from '@excalidraw/excalidraw/types'

interface Props {
  pageId: string
  ExcalidrawComponent: React.ComponentType<Record<string, unknown>>
}

export function ExcalidrawEditor({ pageId, ExcalidrawComponent }: Props) {
  const router = useRouter()
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [name, setName] = useState('New Page')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [injectedCount, setInjectedCount] = useState(0)
  const nameRef = useRef(name)
  nameRef.current = name
  const agentVersionRef = useRef<number>(0)

  const drawFullscreen = useLayoutStore((s) => s.drawFullscreen)

  const { setPageCache, getPageCache } = useDrawStore()

  // Sync browser native fullscreen with our state
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        useLayoutStore.getState().exitDrawFullscreen()
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // F key toggles fullscreen (only when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        useLayoutStore.getState().toggleDrawFullscreen()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Enter/exit browser native fullscreen when state changes
  useEffect(() => {
    if (drawFullscreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [drawFullscreen])

  // Load data from Supabase
  useEffect(() => {
    if (!api || loaded) return

    getDrawData(pageId).then((page) => {
      if (!page) {
        useDrawStore.getState().setLastPageId(null)
        router.push('/draw')
        return
      }

      setName(page.name)
      useDrawStore.getState().setLastPageId(pageId)
      agentVersionRef.current = page.agent_version ?? 0

      const elems = sanitizeElements(
        (page.page_elements?.elements ?? []) as Record<string, unknown>[],
      )
      const files = page.page_elements?.files ?? {}

      api.updateScene({
        elements: elems as unknown as NonDeletedExcalidrawElement[],
      })

      if (files && Object.keys(files).length > 0) {
        api.addFiles(Object.values(files) as BinaryFiles[keyof BinaryFiles][])
      }

      setLoaded(true)
    })
  }, [api, pageId, loaded, router])

  // Realtime subscription for agent injection
  useEffect(() => {
    if (!api || !loaded) return

    const supabase = createClient()

    const channel = supabase
      .channel(`draw-agent-${pageId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'draw',
          filter: `page_id=eq.${pageId}`,
        },
        (payload) => {
          const newRow = payload.new as {
            agent_version: number
            page_elements: DrawElements | null
          }
          const incomingVersion = newRow.agent_version ?? 0

          // Only process if agent_version increased (injection from agent)
          if (incomingVersion <= agentVersionRef.current) return
          agentVersionRef.current = incomingVersion

          const serverElements = sanitizeElements(
            (newRow.page_elements?.elements ?? []) as Record<string, unknown>[],
          ) as Array<Record<string, unknown> & { id: string }>
          const localElements = api.getSceneElements()
          const localIds = new Set(localElements.map((el) => el.id))
          const newElements = serverElements.filter((el) => !localIds.has(el.id))

          if (newElements.length === 0) return

          // Merge: keep local + add new
          api.updateScene({
            elements: [
              ...localElements,
              ...newElements,
            ] as NonDeletedExcalidrawElement[],
          })

          // Handle new files
          const serverFiles = (newRow.page_elements?.files ?? {}) as Record<
            string,
            unknown
          >
          const localFiles = api.getFiles()
          const newFileEntries = Object.entries(serverFiles).filter(
            ([key]) => !(key in localFiles),
          )
          if (newFileEntries.length > 0) {
            api.addFiles(
              newFileEntries.map(([, v]) => v) as BinaryFiles[keyof BinaryFiles][],
            )
          }

          // Pan to the new elements
          api.scrollToContent(
            newElements as unknown as NonDeletedExcalidrawElement[],
            { fitToContent: true },
          )

          // Visual feedback
          setInjectedCount(newElements.length)
          setTimeout(() => setInjectedCount(0), 3000)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [api, pageId, loaded])

  // Auto-save every 3 seconds (never touches agent_version)
  const save = useCallback(async () => {
    if (!api) return

    const elements = api.getSceneElements()
    const files = api.getFiles()
    const cached = getPageCache(pageId)

    const elementsUnchanged = cached && JSON.stringify(cached.elements) === JSON.stringify(elements)
    const nameUnchanged = cached && cached.name === nameRef.current
    if (elementsUnchanged && nameUnchanged) return

    setSaving(true)
    const now = new Date().toISOString()

    setPageCache(pageId, {
      elements,
      files: files as unknown as Record<string, unknown>,
      name: nameRef.current,
      updatedAt: now,
    })

    try {
      await saveDrawData(
        pageId,
        elements as unknown as Record<string, unknown>[],
        nameRef.current,
        files as unknown as Record<string, unknown>,
      )
    } catch (err) {
      console.error('Failed to save drawing:', err)
    } finally {
      setSaving(false)
    }
  }, [api, pageId, getPageCache, setPageCache])

  useEffect(() => {
    const interval = setInterval(save, 3000)
    return () => clearInterval(interval)
  }, [save])

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
        {!drawFullscreen && (
          <button
            onClick={() => useLayoutStore.getState().toggleDrawSidebar()}
            className="p-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <PanelLeft size={16} />
          </button>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border border-white/[0.08] rounded-lg px-3 py-1 text-sm text-white/80 w-48 focus:outline-none focus:border-white/20"
          placeholder="Page title"
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saving && (
          <span className="text-[10px] text-white/30">Syncing...</span>
        )}
        {injectedCount > 0 && (
          <span className="text-[10px] text-violet-400 animate-pulse">
            Agent added {injectedCount} elements
          </span>
        )}

        {/* Spacer + fullscreen toggle */}
        <div className="flex-1" />
        <button
          onClick={() => useLayoutStore.getState().toggleDrawFullscreen()}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-colors"
          title={drawFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {drawFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <ExcalidrawComponent
          excalidrawAPI={(a: unknown) => setApi(a as ExcalidrawImperativeAPI)}
          initialData={{ elements: [], files: {} }}
          theme="dark"
          autoFocus
        />
      </div>
    </div>
  )
}
