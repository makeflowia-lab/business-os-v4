'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Transaction,
  GastoMensual,
  GastoAnual,
  FinanceKPIs,
  VistaRango,
} from '../types'

interface CustomDateRange {
  start: Date | null
  end: Date | null
}

interface FinancesState {
  // Data
  transactions: Transaction[]
  gastosMensuales: GastoMensual[]
  gastosAnuales: GastoAnual[]

  // UI State
  vista: VistaRango
  customDateRange: CustomDateRange
  isLoading: boolean
  error: string | null

  // Computed (cached)
  kpis: FinanceKPIs

  // Actions
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void

  setGastosMensuales: (gastos: GastoMensual[]) => void
  addGastoMensual: (gasto: GastoMensual) => void
  removeGastoMensual: (id: string) => void
  updateGastoMensual: (id: string, updates: Partial<GastoMensual>) => void

  setGastosAnuales: (gastos: GastoAnual[]) => void
  addGastoAnual: (gasto: GastoAnual) => void
  removeGastoAnual: (id: string) => void
  updateGastoAnual: (id: string, updates: Partial<GastoAnual>) => void

  setVista: (vista: VistaRango) => void
  setCustomDateRange: (start: Date | null, end: Date | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  recalculateKPIs: () => void
  reset: () => void
}

const calculateKPIs = (transactions: Transaction[]): FinanceKPIs => {
  // Excluir transferencias de KPIs - son movimientos internos, no ingresos/gastos reales
  const totalIngresos = transactions
    .filter((t) => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + Number(t.monto), 0)

  const totalGastos = transactions
    .filter((t) => t.tipo === 'gasto')
    .reduce((sum, t) => sum + Number(t.monto), 0)

  // Solo contar transacciones reales (no transferencias) para el count de operaciones
  const transaccionesReales = transactions.filter((t) => t.tipo !== 'transferencia')

  return {
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    transaccionesCount: transaccionesReales.length,
  }
}

const DEFAULT_KPIS: FinanceKPIs = {
  totalIngresos: 0,
  totalGastos: 0,
  balance: 0,
  transaccionesCount: 0,
}

export const useFinancesStore = create<FinancesState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      gastosMensuales: [],
      gastosAnuales: [],
      vista: 'historico',
      customDateRange: { start: null, end: null },
      isLoading: false,
      error: null,
      kpis: DEFAULT_KPIS,

      // Transaction actions
      setTransactions: (transactions) => {
        set({ transactions, kpis: calculateKPIs(transactions) })
      },

      addTransaction: (transaction) => {
        const newTransactions = [transaction, ...get().transactions]
        set({ transactions: newTransactions, kpis: calculateKPIs(newTransactions) })
      },

      removeTransaction: (id) => {
        const newTransactions = get().transactions.filter((t) => t.id !== id)
        set({ transactions: newTransactions, kpis: calculateKPIs(newTransactions) })
      },

      updateTransaction: (id, updates) => {
        const newTransactions = get().transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
        set({ transactions: newTransactions, kpis: calculateKPIs(newTransactions) })
      },

      // Gastos mensuales actions
      setGastosMensuales: (gastos) => set({ gastosMensuales: gastos }),

      addGastoMensual: (gasto) => {
        set({ gastosMensuales: [...get().gastosMensuales, gasto] })
      },

      removeGastoMensual: (id) => {
        set({ gastosMensuales: get().gastosMensuales.filter((g) => g.id !== id) })
      },

      updateGastoMensual: (id, updates) => {
        set({
          gastosMensuales: get().gastosMensuales.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })
      },

      // Gastos anuales actions
      setGastosAnuales: (gastos) => set({ gastosAnuales: gastos }),

      addGastoAnual: (gasto) => {
        set({ gastosAnuales: [...get().gastosAnuales, gasto] })
      },

      removeGastoAnual: (id) => {
        set({ gastosAnuales: get().gastosAnuales.filter((g) => g.id !== id) })
      },

      updateGastoAnual: (id, updates) => {
        set({
          gastosAnuales: get().gastosAnuales.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })
      },

      // UI actions
      setVista: (vista) => set({ vista }),
      setCustomDateRange: (start, end) => set({ customDateRange: { start, end } }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      recalculateKPIs: () => {
        set({ kpis: calculateKPIs(get().transactions) })
      },

      reset: () => {
        set({
          transactions: [],
          gastosMensuales: [],
          gastosAnuales: [],
          vista: 'historico',
          customDateRange: { start: null, end: null },
          isLoading: false,
          error: null,
          kpis: DEFAULT_KPIS,
        })
      },
    }),
    {
      name: 'profits-os-finances',
      partialize: (state) => ({
        vista: state.vista,
        customDateRange: state.customDateRange,
      }),
    }
  )
)
