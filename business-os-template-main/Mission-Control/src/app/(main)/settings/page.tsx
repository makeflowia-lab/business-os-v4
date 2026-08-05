'use client'
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile, updateAvatar } from '@/actions/auth'
import {
  Tag,
  Plus,
  Trash2,
  XCircle,
  Save,
  Palette,
  AlertTriangle,
  Bell,
  BellOff,
  Smartphone,
  Camera,
  Mail,
  Shield,
  CalendarDays,
  Loader2,
  UserCircle,
  MessageSquare,
  MessageSquareOff,
} from 'lucide-react'
import type { Label } from '@/types/database'
import { usePushSubscription } from '@/features/notifications/hooks/usePushSubscription'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6',
]

function SettingsContent() {
  const { isOwner, profile } = useAuth()
  const searchParams = useSearchParams()
  const labelsRef = useRef<HTMLElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { status: pushStatus, loading: pushLoading, subscribe, unsubscribe } = usePushSubscription()
  const [labels, setLabels] = useState<Label[]>([])
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])

  // Profile state
  const [profileName, setProfileName] = useState('')
  const [profileNameLoaded, setProfileNameLoaded] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (profile && !profileNameLoaded) {
    setProfileName(profile.full_name ?? '')
    setProfileNameLoaded(true)
  }

  const avatarSrc = avatarPreview ?? profile?.avatar_url
  const initials = (profile?.full_name ?? profile?.email ?? '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    setProfileMsg(null)
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await updateAvatar(fd)
    setAvatarUploading(false)
    if (result.error) {
      setProfileMsg({ type: 'error', text: result.error })
      setAvatarPreview(null)
    } else {
      setProfileMsg({ type: 'success', text: 'Avatar updated' })
      if (result.avatar_url) setAvatarPreview(result.avatar_url)
    }
  }

  const handleSaveProfileName = async () => {
    setProfileSaving(true)
    setProfileMsg(null)
    const fd = new FormData()
    fd.append('full_name', profileName)
    const result = await updateProfile(fd)
    setProfileSaving(false)
    if (result.error) {
      setProfileMsg({ type: 'error', text: result.error })
    } else {
      setProfileMsg({ type: 'success', text: 'Name updated' })
    }
  }
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [editLabelName, setEditLabelName] = useState('')
  const [editLabelColor, setEditLabelColor] = useState('')
  const [isMobilePwa, setIsMobilePwa] = useState(false)
  const [chatBubbleHidden, setChatBubbleHidden] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('mc_chatBubbleHidden') === 'true'
  })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const labelsRes = await supabase.from('labels').select('*').order('name')
    if (labelsRes.data) setLabels(labelsRes.data as Label[])
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobilePwa(isStandalone && isMobile)
  }, [])

  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'labels') labelsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [searchParams, isOwner])

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('labels')
      .insert({ name: newLabelName.trim(), color: newLabelColor })
      .select('*')
      .single()
    if (data) {
      setLabels((prev) => [...prev, data as Label])
    }
    setNewLabelName('')
    setNewLabelColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)])
    setSaving(false)
  }

  const handleUpdateLabel = async (id: string) => {
    if (!editLabelName.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('labels')
      .update({ name: editLabelName.trim(), color: editLabelColor })
      .eq('id', id)
    setLabels((prev) =>
      prev.map((l) => l.id === id ? { ...l, name: editLabelName.trim(), color: editLabelColor } : l)
    )
    setEditingLabel(null)
    setSaving(false)
  }

  const handleDeleteLabel = async (id: string) => {
    const supabase = createClient()
    await supabase.from('labels').delete().eq('id', id)
    setLabels((prev) => prev.filter((l) => l.id !== id))
  }

  const startEditLabel = (label: Label) => {
    setEditingLabel(label.id)
    setEditLabelName(label.name)
    setEditLabelColor(label.color)
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-3xl mx-auto p-6 space-y-8 pb-24">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your profile, labels, and notifications.</p>
      </div>

      {/* Profile */}
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <UserCircle size={16} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white/80">Profile</h2>
          </div>
          <p className="text-xs text-white/30 mt-1">Your display name, avatar, and account info</p>
        </div>
        <div className="p-5 space-y-5">
          {profileMsg && (
            <div className={`text-xs px-3 py-2 rounded-lg ${profileMsg.type === 'success' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
              {profileMsg.text}
            </div>
          )}

          {/* Avatar + Name row */}
          <div className="flex items-start gap-5">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative group flex-shrink-0"
              disabled={avatarUploading}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.08]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white/[0.08]">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? <Loader2 size={18} className="animate-spin text-white/70" /> : <Camera size={18} className="text-white/70" />}
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />

            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-white/50">Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={handleSaveProfileName}
                  disabled={profileSaving || profileName === (profile?.full_name ?? '')}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-colors"
                >
                  {profileSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-white/30" />
              <span className="text-xs text-white/50">{profile?.email ?? '---'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-white/30" />
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                profile?.role === 'owner' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {profile?.role === 'owner' ? 'Owner' : 'Member'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-white/30" />
              <span className="text-xs text-white/50">
                Since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '---'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Labels Management -- Owner only */}
      {isOwner && (
      <section ref={labelsRef} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-white/50" />
              <h2 className="text-sm font-semibold text-white/80">Labels</h2>
              <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded-full text-white/30">
                {labels.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/30 mt-1">Organize tasks with color-coded labels</p>
        </div>
        <div className="p-5 space-y-3">
          {/* Create new label */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewLabelColor(color)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    newLabelColor === color ? 'ring-2 ring-white/30 ring-offset-1 ring-offset-[#0a0a0f] scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateLabel() }}
              placeholder="New label name..."
              className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-white/[0.15]"
            />
            <button
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim() || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.08] text-white/60 border border-white/[0.1] hover:bg-white/[0.12] transition-colors disabled:opacity-30"
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          {/* Existing labels */}
          <div className="space-y-1">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] group hover:bg-white/[0.04] transition-colors"
              >
                {editingLabel === label.id ? (
                  <>
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditLabelColor(color)}
                          className={`w-4 h-4 rounded-full transition-transform ${
                            editLabelColor === color ? 'ring-2 ring-white/30 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editLabelName}
                      onChange={(e) => setEditLabelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateLabel(label.id)
                        if (e.key === 'Escape') setEditingLabel(null)
                      }}
                      autoFocus
                      className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-0.5 text-sm text-white outline-none"
                    />
                    <button
                      onClick={() => handleUpdateLabel(label.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingLabel(null)}
                      className="p-1 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="flex-1 text-sm text-white/70">{label.name}</span>
                    <button
                      onClick={() => startEditLabel(label)}
                      className="p-1 text-white/20 hover:text-white/50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Palette size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {labels.length === 0 && (
              <p className="text-xs text-white/20 text-center py-4">No labels created yet</p>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Push Notifications -- mobile PWA only */}
      {isMobilePwa && (
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white/80">Push Notifications</h2>
          </div>
          <p className="text-xs text-white/30 mt-1">Receive alerts even when Mission Control is closed</p>
        </div>
        <div className="p-5">
          {pushStatus === 'unsupported' && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <BellOff size={14} />
              <span>Push notifications not supported in this browser</span>
            </div>
          )}

          {pushStatus === 'denied' && (
            <div className="flex items-center gap-2 text-xs text-yellow-400/70">
              <AlertTriangle size={14} />
              <span>Notifications blocked -- enable them in your browser settings</span>
            </div>
          )}

          {(pushStatus === 'subscribed' || pushStatus === 'unsubscribed') && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  pushStatus === 'subscribed' ? 'bg-violet-500/20 text-violet-400' : 'bg-white/[0.06] text-white/30'
                }`}>
                  {pushStatus === 'subscribed' ? <Bell size={16} /> : <BellOff size={16} />}
                </div>
                <div>
                  <p className="text-sm text-white/70">
                    {pushStatus === 'subscribed' ? 'Push notifications active' : 'Push notifications off'}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {pushStatus === 'subscribed'
                      ? 'You will receive alerts for agent activity'
                      : 'Enable to get alerts when agents are active'}
                  </p>
                </div>
              </div>
              <button
                onClick={pushStatus === 'subscribed' ? unsubscribe : subscribe}
                disabled={pushLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40
                  ${pushStatus === 'subscribed'
                    ? 'bg-white/[0.06] text-white/50 border border-white/[0.1] hover:bg-red-400/[0.08] hover:text-red-400/70 hover:border-red-400/20'
                    : 'bg-violet-500/90 hover:bg-violet-500 text-white'
                  }`}
              >
                {pushLoading ? (
                  <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                ) : pushStatus === 'subscribed' ? (
                  <BellOff size={12} />
                ) : (
                  <Bell size={12} />
                )}
                {pushStatus === 'subscribed' ? 'Disable' : 'Enable'}
              </button>
            </div>
          )}

          {pushStatus === 'loading' && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
              <span>Checking notification status...</span>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Chat Bubble Toggle */}
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white/80">Chat Bubble</h2>
          </div>
          <p className="text-xs text-white/30 mt-1">The floating assistant chat on the bottom-right corner</p>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                !chatBubbleHidden ? 'bg-violet-500/20 text-violet-400' : 'bg-white/[0.06] text-white/30'
              }`}>
                {!chatBubbleHidden ? <MessageSquare size={16} /> : <MessageSquareOff size={16} />}
              </div>
              <div>
                <p className="text-sm text-white/70">
                  {!chatBubbleHidden ? 'Chat bubble visible' : 'Chat bubble hidden'}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {!chatBubbleHidden
                    ? 'Assistant appears on every page'
                    : 'Use the /chat page to talk to the assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !chatBubbleHidden
                setChatBubbleHidden(next)
                localStorage.setItem('mc_chatBubbleHidden', String(next))
                window.dispatchEvent(new Event('mc:chatBubbleToggle'))
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${!chatBubbleHidden
                  ? 'bg-white/[0.06] text-white/50 border border-white/[0.1] hover:bg-red-400/[0.08] hover:text-red-400/70 hover:border-red-400/20'
                  : 'bg-violet-500/90 hover:bg-violet-500 text-white'
                }`}
            >
              {!chatBubbleHidden ? <MessageSquareOff size={12} /> : <MessageSquare size={12} />}
              {!chatBubbleHidden ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </section>

    </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}
