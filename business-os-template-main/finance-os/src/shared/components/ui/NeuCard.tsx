import { ReactNode } from 'react'

interface NeuCardProps {
  children: ReactNode
  className?: string
  variant?: 'raised' | 'inset' | 'flat'
  size?: 'sm' | 'md' | 'lg'
}

export function NeuCard({
  children,
  className = '',
  variant = 'raised',
  size = 'md',
}: NeuCardProps) {
  const sizeClasses = {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-2xl',
    lg: 'p-8 rounded-3xl',
  }

  const variantClasses = {
    raised: 'shadow-neu',
    inset: 'shadow-neu-inset',
    flat: 'shadow-neu-sm',
  }

  return (
    <div
      className={`
        bg-neu-bg
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
