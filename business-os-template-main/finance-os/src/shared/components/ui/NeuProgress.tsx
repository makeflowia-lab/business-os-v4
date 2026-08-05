interface NeuProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function NeuProgress({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
}: NeuProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  }

  const variantColors = {
    default: 'from-blue-400 to-blue-600',
    success: 'from-emerald-400 to-emerald-600',
    warning: 'from-amber-400 to-amber-600',
    danger: 'from-red-400 to-red-600',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-600">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-gray-700">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`
          w-full
          bg-neu-bg
          rounded-full
          shadow-neu-inset-sm
          overflow-hidden
          ${sizeClasses[size]}
        `}
      >
        <div
          className={`
            h-full
            bg-gradient-to-r ${variantColors[variant]}
            rounded-full
            shadow-[2px_0_4px_rgba(0,0,0,0.1)]
            transition-all duration-500 ease-out
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
