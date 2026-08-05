'use client'

import { CreditCard, Banknote } from 'lucide-react'
import { Transaction, CuentaDB, Cuenta } from '../types'
import {
  calculateBalancesByCuenta,
  formatCurrency,
  CuentaBalance,
} from '../services/analytics'

interface AccountsOverviewProps {
  transactions: Transaction[]
  cuentas: CuentaDB[]
}

const SHORT_NAMES: Record<Cuenta, string> = {
  'Primary Checking': 'Primary',
  'Secondary Checking': 'Secondary',
  Cash: 'Cash',
  'Credit Card 1': 'CC 1',
  'Credit Card 2': 'CC 2',
}

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-500',
    border: 'border-purple-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    icon: 'text-orange-500',
    border: 'border-orange-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  pink: {
    bg: 'bg-pink-500/10',
    icon: 'text-pink-500',
    border: 'border-pink-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  gray: {
    bg: 'bg-gray-500/10',
    icon: 'text-gray-500',
    border: 'border-gray-500/20',
  },
}

export function AccountsOverview({ transactions, cuentas }: AccountsOverviewProps) {
  const balances = calculateBalancesByCuenta(transactions, cuentas)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Mis Cuentas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {balances.map((item: CuentaBalance) => {
          const colors = colorClasses[item.color] || colorClasses.gray
          const Icon = item.tipo === 'efectivo' ? Banknote : CreditCard
          const isNegative = item.balance < 0

          return (
            <div
              key={item.cuenta}
              className={`bg-neu-bg shadow-neu rounded-xl p-4 transition-all duration-300 hover:shadow-neu-md border ${colors.border}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <span className="text-sm font-medium text-gray-600 truncate">
                  {SHORT_NAMES[item.cuenta] || item.cuenta}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Balance</p>
                <p
                  className={`text-lg font-bold ${
                    isNegative ? 'text-red-500' : 'text-gray-800'
                  }`}
                >
                  {formatCurrency(item.balance)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
