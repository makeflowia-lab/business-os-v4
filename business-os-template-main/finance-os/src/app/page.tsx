'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { NavBar } from '@/shared/components/ui/NavBar'
import { useFinancesStore } from '@/features/finances/store/financesStore'
import { useCalculatorStore } from '@/features/calculator'
import { FinanceKPI } from '@/features/finances/components/FinanceKPI'
import { TrendChart } from '@/features/finances/components/TrendChart'
import { CategoryDistribution } from '@/features/finances/components/CategoryDistribution'
import { AccountsOverview } from '@/features/finances/components/AccountsOverview'
import { TransactionsTable } from '@/features/finances/components/TransactionsTable'
import { AddTransactionModal } from '@/features/finances/components/AddTransactionModal'
import { DateRangeSelector } from '@/features/finances/components/DateRangeSelector'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/features/finances/services/transactions'
import { fetchCuentas } from '@/features/finances/services/cuentas'
import { summarizeByCategory } from '@/features/finances/services/analytics'
import { Transaction, TransactionInput, TipoTransaccion, CuentaDB } from '@/features/finances/types'
import { QuickActionButtons } from '@/features/finances/components/QuickActionButtons'

export default function HomePage() {
  const {
    transactions,
    kpis,
    vista,
    customDateRange,
    isLoading,
    setTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction: updateTransactionInStore,
    setVista,
    setCustomDateRange,
    setLoading,
    setError,
  } = useFinancesStore()

  const { inputs } = useCalculatorStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialTipo, setInitialTipo] = useState<TipoTransaccion | undefined>()
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [gastosData, setGastosData] = useState<ReturnType<typeof summarizeByCategory>>([])
  const [ingresosData, setIngresosData] = useState<ReturnType<typeof summarizeByCategory>>([])
  const [cuentas, setCuentas] = useState<CuentaDB[]>([])
  const hasProcessedRecurring = useRef(false)

  // Procesar gastos recurrentes automáticamente al cargar
  const processRecurringExpenses = useCallback(async () => {
    if (hasProcessedRecurring.current) return
    hasProcessedRecurring.current = true

    try {
      const res = await fetch('/api/gastos-mensuales/procesar', { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        if (result.procesados > 0) {
          console.log(`[Recurrentes] ${result.procesados} gastos procesados automáticamente`)
        }
      }
    } catch (err) {
      console.error('[Recurrentes] Error al procesar:', err)
    }
  }, [])

  const handleQuickAction = (tipo: TipoTransaccion) => {
    setInitialTipo(tipo)
    setEditTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction)
    setInitialTipo(undefined)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setInitialTipo(undefined)
    setEditTransaction(null)
  }

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const [data, cuentasData] = await Promise.all([
        fetchTransactions(
          vista,
          customDateRange.start ?? undefined,
          customDateRange.end ?? undefined
        ),
        fetchCuentas(),
      ])
      setTransactions(data)
      setCuentas(cuentasData)
      setGastosData(summarizeByCategory(data, 'gasto'))
      setIngresosData(summarizeByCategory(data, 'ingreso'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [vista, customDateRange, setTransactions, setLoading, setError])

  useEffect(() => {
    // Primero procesar recurrentes, luego cargar transacciones
    processRecurringExpenses().then(() => loadTransactions())
  }, [processRecurringExpenses, loadTransactions])

  const handleAddTransaction = async (input: TransactionInput) => {
    const newTransaction = await createTransaction(input)
    addTransaction(newTransaction)
    const updated = [newTransaction, ...transactions]
    setGastosData(summarizeByCategory(updated, 'gasto'))
    setIngresosData(summarizeByCategory(updated, 'ingreso'))
  }

  const handleUpdateTransaction = async (id: string, input: Partial<TransactionInput>) => {
    const updatedTransaction = await updateTransaction(id, input)
    updateTransactionInStore(id, updatedTransaction)
    const updated = transactions.map((t) => (t.id === id ? updatedTransaction : t))
    setGastosData(summarizeByCategory(updated, 'gasto'))
    setIngresosData(summarizeByCategory(updated, 'ingreso'))
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
    removeTransaction(id)
    const updated = transactions.filter((t) => t.id !== id)
    setGastosData(summarizeByCategory(updated, 'gasto'))
    setIngresosData(summarizeByCategory(updated, 'ingreso'))
  }

  return (
    <div className="min-h-screen bg-neu-bg">
      <NavBar />

      <main className="p-6 pb-24 md:p-8 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Centro de control financiero
                {inputs?.businessName && ` - ${inputs.businessName}`}
              </p>
            </div>
          </div>

          {/* Date Range Selector */}
          <DateRangeSelector
            vista={vista}
            customRange={customDateRange}
            onVistaChange={setVista}
            onCustomRangeChange={setCustomDateRange}
          />

          {/* Main Content: Finance Dashboard */}
          <div className="space-y-8">
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FinanceKPI
                title="Ingresos"
                value={kpis.totalIngresos}
                icon="income"
                variant="positive"
              />
              <FinanceKPI
                title="Gastos"
                value={kpis.totalGastos}
                icon="expense"
                variant="negative"
              />
              <FinanceKPI
                title="Balance"
                value={kpis.balance}
                icon="balance"
                variant={kpis.balance >= 0 ? 'positive' : 'negative'}
              />
              <FinanceKPI
                title="Transacciones"
                value={kpis.transaccionesCount}
                icon="transactions"
                variant="neutral"
              />
            </div>

            {/* Charts */}
            <TrendChart transactions={transactions} />

            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryDistribution
                data={gastosData}
                title="Gastos por Categoría"
                type="gasto"
              />
              <CategoryDistribution
                data={ingresosData}
                title="Ingresos por Categoría"
                type="ingreso"
              />
            </div>

            {/* Accounts Overview */}
            <AccountsOverview transactions={transactions} cuentas={cuentas} />

            {/* Table */}
            <TransactionsTable
              transactions={transactions}
              onDelete={handleDeleteTransaction}
              onEdit={handleEditTransaction}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        initialTipo={initialTipo}
        editTransaction={editTransaction}
      />

      {/* Quick Action FABs */}
      <QuickActionButtons onQuickAction={handleQuickAction} />
    </div>
  )
}
