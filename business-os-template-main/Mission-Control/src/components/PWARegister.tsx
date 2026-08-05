'use client'
import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

        // Check for updates every hour
        const checkInterval = setInterval(() => {
          reg.update().catch(() => undefined)
        }, 60 * 60 * 1000)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW available — send skip waiting message
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        return () => clearInterval(checkInterval)
      } catch (err) {
        console.error('SW registration failed:', err)
      }
    }

    register()
  }, [])

  return null
}
