'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFiltersStore } from '@/shared/stores/filters-store'
import {
  ArrowLeft,
  Mail,
  Shield,
  CalendarDays,
  Loader2,
  LayoutGrid,
  ListChecks,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { Profile, TaskStatus } from '@/types/database'

interface TaskStats {
  total: number
  in_progress: number
  done: number
  todo: number
}

export default function TeamMemberPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { resetFilters, setFilter } = useFiltersStore()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<TaskStats>({ total: 0, in_progress: 0, done: 0, todo: 0 })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!params.id) return

    const fetchData = async () => {
      const supabase = createClient()

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(profileData as Profile)

      // Fetch task stats via task_assignees join
      const { data: assignments } = await supabase
        .from('task_assignees')
        .select('tasks(status)')
        .eq('profile_id', params.id)

      if (assignments) {
        const counts: TaskStats = { total: 0, in_progress: 0, done: 0, todo: 0 }
        for (const a of assignments) {
          const task = a.tasks as unknown as { status: TaskStatus } | null
          if (!task) continue
          counts.total++
          if (task.status === 'in_progress') counts.in_progress++
          else if (task.status === 'done') counts.done++
          else if (task.status === 'todo') counts.todo++
        }
        setStats(counts)
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id])

  const handleViewTasks = () => {
    resetFilters()
    setFilter('assigneeId', params.id)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm text-white/40">Member not found</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          Go back
        </button>
      </div>
    )
  }

  const initials = (profile.full_name ?? profile.email ?? '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  const roleBadge = {
    owner: { label: 'Owner', cls: 'bg-violet-500/20 text-violet-400' },
    admin: { label: 'Admin', cls: 'bg-blue-500/20 text-blue-400' },
    member: { label: 'Member', cls: 'bg-emerald-500/20 text-emerald-400' },
  }[profile.role] ?? { label: profile.role, cls: 'bg-white/10 text-white/50' }

  const statCards = [
    { label: 'Total', value: stats.total, icon: ListChecks, color: 'text-white/60' },
    { label: 'To-do', value: stats.todo, icon: Clock, color: 'text-yellow-400/70' },
    { label: 'In Progress', value: stats.in_progress, icon: LayoutGrid, color: 'text-blue-400/70' },
    { label: 'Done', value: stats.done, icon: CheckCircle2, color: 'text-emerald-400/70' },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto p-6 space-y-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Profile Card */}
        <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.08]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white/[0.08]">
                {initials}
              </div>
            )}

            {/* Name */}
            <h1 className="text-lg font-semibold text-white/90">
              {profile.full_name ?? 'User'}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${roleBadge.cls}`}>
                {roleBadge.label}
              </span>
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-white/30" />
                <span className="text-xs text-white/50">{profile.email ?? '—'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={12} className="text-white/30" />
                <span className="text-xs text-white/50">Since {memberSince}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Task Stats */}
        <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white/80">Activity</h2>
            <p className="text-xs text-white/30 mt-0.5">Task assignment overview</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center"
                >
                  <Icon size={16} className={`mx-auto mb-2 ${color}`} />
                  <p className="text-lg font-bold text-white/90">{value}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* View Tasks CTA */}
        <button
          onClick={handleViewTasks}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3">
            <LayoutGrid size={16} className="text-violet-400/70" />
            <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
              View Tasks on Board
            </span>
          </div>
          <ArrowLeft size={14} className="text-white/30 rotate-180" />
        </button>
      </div>
    </div>
  )
}
