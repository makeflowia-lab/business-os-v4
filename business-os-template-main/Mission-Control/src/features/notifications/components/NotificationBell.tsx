'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, BellOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@/types/database'
import { usePushSubscription } from '../hooks/usePushSubscription'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const { status: pushStatus, loading: pushLoading, subscribe, unsubscribe } = usePushSubscription()

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data as Notification[])
      setUnreadCount(data.filter((n) => !n.delivered).length)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    const supabase = createClient()
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ delivered: true }).eq('delivered', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, delivered: true })))
    setUnreadCount(0)
  }

  const handlePushToggle = () => {
    if (pushStatus === 'subscribed') {
      unsubscribe()
    } else if (pushStatus === 'unsubscribed') {
      subscribe()
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/80 relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-white/80">Notifications</h3>
            <div className="flex items-center gap-2">
              {/* Push toggle */}
              {pushStatus !== 'unsupported' && pushStatus !== 'loading' && (
                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading || pushStatus === 'denied'}
                  title={
                    pushStatus === 'denied'
                      ? 'Push bloqueado — permite en ajustes del browser'
                      : pushStatus === 'subscribed'
                      ? 'Desactivar notificaciones push'
                      : 'Activar notificaciones push'
                  }
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md transition-colors disabled:opacity-40
                    ${pushStatus === 'subscribed'
                      ? 'text-violet-400 bg-violet-400/10 hover:bg-violet-400/20'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.06]'
                    }`}
                >
                  {pushLoading ? (
                    <span className="w-2.5 h-2.5 border border-white/30 border-t-white/70 rounded-full animate-spin" />
                  ) : pushStatus === 'subscribed' ? (
                    <Bell size={10} />
                  ) : (
                    <BellOff size={10} />
                  )}
                  <span>{pushStatus === 'subscribed' ? 'Push on' : 'Push'}</span>
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors
                    ${!n.delivered ? 'bg-white/[0.02]' : ''}
                  `}
                >
                  <div className="flex items-start gap-2">
                    {!n.delivered && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/70 leading-relaxed">{n.content}</p>
                      {n.created_at && (
                        <p className="text-[10px] text-white/25 mt-0.5">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-white/20">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
