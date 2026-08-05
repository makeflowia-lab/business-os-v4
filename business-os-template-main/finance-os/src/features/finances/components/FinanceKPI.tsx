'use client'

import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react'
import { formatCurrency } from '../services/analytics'

interface FinanceKPIProps {
  title: string
  value: number
  icon: 'income' | 'expense' | 'balance' | 'transactions'
  variant?: 'positive' | 'negative' | 'neutral'
}

const iconMap = {
  income: TrendingUp,
  expense: TrendingDown,
  balance: Wallet,
  transactions: Receipt,
}

const colorMap = {
  positive: {
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  negative: {
    icon: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  neutral: {
    icon: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
}

export function FinanceKPI({
  title,
  value,
  icon,
  variant = 'neutral',
}: FinanceKPIProps) {
  const Icon = iconMap[icon]
  const colors = colorMap[variant]

  const displayValue =
    icon === 'transactions' ? value.toString() : formatCurrency(value)

  return (
    <div className="bg-neu-bg shadow-neu rounded-2xl p-6 transition-all duration-300 hover:shadow-neu-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{displayValue}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
