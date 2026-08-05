import { MetricStatus } from '@/features/calculator/types'

interface StatusIndicatorProps {
  status: MetricStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const statusConfig = {
  critical: {
    color: 'bg-red-500',
    label: 'Crítico',
    icon: '🔴',
    textColor: 'text-red-600',
  },
  warning: {
    color: 'bg-amber-500',
    label: 'Atención',
    icon: '🟡',
    textColor: 'text-amber-600',
  },
  healthy: {
    color: 'bg-emerald-500',
    label: 'Saludable',
    icon: '🟢',
    textColor: 'text-emerald-600',
  },
}

export function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status]

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          ${config.color}
          rounded-full
          animate-pulse
        `}
      />
      {showLabel && (
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  )
}
