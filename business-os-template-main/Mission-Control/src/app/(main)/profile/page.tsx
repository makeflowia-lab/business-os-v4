'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile, updateAvatar } from '@/actions/auth'
import { Camera, Mail, Shield, CalendarDays, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { profile, loading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [nameLoaded, setNameLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync name from profile once loaded
  if (profile && !nameLoaded) {
    setName(profile.full_name ?? '')
    setNameLoaded(true)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
  }

  const avatarSrc = avatarPreview ?? profile?.avatar_url
  const initials = (profile?.full_name ?? profile?.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    setMessage(null)

    const fd = new FormData()
    fd.append('avatar', file)
    const result = await updateAvatar(fd)

    setUploading(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      setAvatarPreview(null)
    } else {
      setMessage({ type: 'success', text: 'Avatar updated' })
      if (result.avatar_url) setAvatarPreview(result.avatar_url)
    }
  }

  const handleSaveName = async () => {
    setSaving(true)
    setMessage(null)

    const fd = new FormData()
    fd.append('full_name', name)
    const result = await updateProfile(fd)

    setSaving(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Name updated' })
    }
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h1 className="text-lg font-semibold text-white/90">Profile</h1>

        {message && (
          <div className={`text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 flex flex-col items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
            disabled={uploading}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-white/[0.08]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/[0.08]">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-white/70" />
              ) : (
                <Camera size={20} className="text-white/70" />
              )}
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-[11px] text-white/30">Click to change photo</p>
        </div>

        {/* Name */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 space-y-3">
          <label className="text-xs font-medium text-white/50">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleSaveName}
            disabled={saving || name === (profile?.full_name ?? '')}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Account Info (read-only) */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-medium text-white/50">Account</h2>

          <div className="flex items-center gap-3">
            <Mail size={15} className="text-white/30" />
            <div>
              <p className="text-xs text-white/30">Email</p>
              <p className="text-sm text-white/70">{profile?.email ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield size={15} className="text-white/30" />
            <div>
              <p className="text-xs text-white/30">Role</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                profile?.role === 'owner'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {profile?.role === 'owner' ? 'Owner' : 'Member'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays size={15} className="text-white/30" />
            <div>
              <p className="text-xs text-white/30">Member since</p>
              <p className="text-sm text-white/70">{memberSince}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
