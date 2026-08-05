'use client'
import { formatDistanceToNow } from 'date-fns'
import { GitCommit, MessageSquare, FileText, Users, CheckCircle } from 'lucide-react'
import type { Activity, ActivityType } from '@/types/database'

const TYPE_ICONS: Record<ActivityType, typeof GitCommit> = {
  status_update: CheckCircle,
  assignees_update: Users,
  task_update: GitCommit,
  message: MessageSquare,
  document_created: FileText,
}

const TYPE_COLORS: Record<ActivityType, string> = {
  status_update: 'text-blue-400',
  assignees_update: 'text-orange-400',
  task_update: 'text-white/60',
  message: 'text-emerald-400',
  document_created: 'text-purple-400',
}

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = TYPE_ICONS[activity.type] || GitCommit
  const color = TYPE_COLORS[activity.type] || 'text-white/60'
  const timeAgo = activity.created_at
    ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
    : ''

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-white/[0.04] transition-colors rounded-lg group">
      {/* Icon */}
      <div className={`mt-0.5 ${color}`}>
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">
          <span className="font-medium text-orange-300">{activity.agent?.name || 'Unknown'}</span>
          {' '}
          <span className="text-white/60">{activity.message}</span>
        </p>
        <p className="text-xs text-white/30 mt-1">{timeAgo}</p>
      </div>
    </div>
  )
}
