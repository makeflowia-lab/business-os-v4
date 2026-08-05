// Mission Control Service Worker — Push + PWA Install
// Handles: fetch (Android installability), push, notification click

const CACHE_NAME = 'mc-sw-v2'

// ── Install/Activate ──────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch (network-first, required for Android PWA installability) ──
self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigation requests (HTML pages)
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() =>
      // Offline fallback: if network fails, try cache, then basic offline page
      caches.match(event.request).then((cached) => cached || new Response(
        '<html><body style="background:#0a0a0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui"><div style="text-align:center"><h2>Offline</h2><p>Check your connection and try again.</p></div></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      ))
    )
  )
})

// ── Push Events ───────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Mission Control', body: event.data.text() }
  }

  const title = payload.title ?? 'Mission Control'
  const options = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icon.svg',
    badge: '/icon.svg',
    tag: payload.tag ?? 'mc-notification',
    data: { url: payload.url ?? '/', notificationId: payload.notificationId },
    requireInteraction: false,
    silent: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// ── Push Subscription Change ──────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: event.oldSubscription?.options?.applicationServerKey })
      .then((subscription) => {
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        })
      })
  )
})
