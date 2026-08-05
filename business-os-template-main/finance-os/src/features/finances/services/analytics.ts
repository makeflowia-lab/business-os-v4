import { Transaction, GastoMensual, GastoAnual, CUENTAS, Cuenta, CuentaDB } from '../types'

export interface CuentaBalance {
  cuenta: Cuenta
  balance: number
  balanceInicial: number
  ingresos: number
  gastos: number
  tipo: 'debito' | 'credito' | 'efectivo'
  color: string
}

export interface CategorySummary {
  categoria: string
  total: number
  porcentaje: number
  count: number
}

export interface TrendDataPoint {
  fecha: string
  ingresos: number
  gastos: number
}

export interface CategoryTrendDataPoint {
  fecha: string
  categorias: Record<string, number>
}

// Agrupa transacciones por categoria
export function summarizeByCategory(
  transactions: Transaction[],
  tipo: 'ingreso' | 'gasto'
): CategorySummary[] {
  const filtered = transactions.filter((t) => t.tipo === tipo)
  const total = filtered.reduce((sum, t) => sum + Number(t.monto), 0)

  const grouped = filtered.reduce(
    (acc, t) => {
      const cat = t.categoria
      if (!acc[cat]) {
        acc[cat] = { total: 0, count: 0 }
      }
      acc[cat].total += Number(t.monto)
      acc[cat].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number }>
  )

  return Object.entries(grouped)
    .map(([categoria, data]) => ({
      categoria,
      total: data.total,
      porcentaje: total > 0 ? (data.total / total) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

// Genera datos para grafica de tendencias
export function generateTrendData(
  transactions: Transaction[],
  days: number = 30
): TrendDataPoint[] {
  const now = new Date()
  const result: TrendDataPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.fecha_hora).toISOString().split('T')[0]
      return tDate === dateStr
    })

    const ingresos = dayTransactions
      .filter((t) => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + Number(t.monto), 0)

    const gastos = dayTransactions
      .filter((t) => t.tipo === 'gasto')
      .reduce((sum, t) => sum + Number(t.monto), 0)

    result.push({ fecha: dateStr, ingresos, gastos })
  }

  return result
}

// Genera datos para gráfica de tendencias por categoría
export function generateCategoryTrendData(
  transactions: Transaction[],
  tipo: 'ingreso' | 'gasto',
  days: number = 30
): { labels: string[]; categories: string[]; data: Record<string, number[]> } {
  const now = new Date()
  const labels: string[] = []
  const dataByCategory: Record<string, number[]> = {}

  // Obtener todas las categorías únicas del tipo
  const categories = [
    ...new Set(
      transactions.filter((t) => t.tipo === tipo).map((t) => t.categoria)
    ),
  ]

  // Inicializar arrays para cada categoría
  categories.forEach((cat) => {
    dataByCategory[cat] = []
  })

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    labels.push(dateStr)

    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.fecha_hora).toISOString().split('T')[0]
      return tDate === dateStr && t.tipo === tipo
    })

    categories.forEach((cat) => {
      const total = dayTransactions
        .filter((t) => t.categoria === cat)
        .reduce((sum, t) => sum + Number(t.monto), 0)
      dataByCategory[cat].push(total)
    })
  }

  return { labels, categories, data: dataByCategory }
}

// Calcula total de gastos recurrentes mensuales
export function calculateMonthlyRecurring(
  gastosMensuales: GastoMensual[]
): number {
  return gastosMensuales
    .filter((g) => g.activo)
    .reduce((sum, g) => sum + Number(g.monto), 0)
}

// Calcula total de gastos recurrentes anuales (prorrateado mensual)
export function calculateAnnualRecurringMonthly(
  gastosAnuales: GastoAnual[]
): number {
  const totalAnual = gastosAnuales
    .filter((g) => g.activo)
    .reduce((sum, g) => sum + Number(g.monto), 0)
  return totalAnual / 12
}

// Obtiene gastos que vencen pronto
export function getUpcomingExpenses(
  gastosMensuales: GastoMensual[],
  daysAhead: number = 7
): GastoMensual[] {
  const today = new Date().getDate()
  const upcoming: GastoMensual[] = []

  gastosMensuales
    .filter((g) => g.activo)
    .forEach((g) => {
      const daysUntil =
        g.dia_de_cobro >= today
          ? g.dia_de_cobro - today
          : 30 - today + g.dia_de_cobro

      if (daysUntil <= daysAhead) {
        upcoming.push(g)
      }
    })

  return upcoming.sort((a, b) => {
    const daysA =
      a.dia_de_cobro >= today
        ? a.dia_de_cobro - today
        : 30 - today + a.dia_de_cobro
    const daysB =
      b.dia_de_cobro >= today
        ? b.dia_de_cobro - today
        : 30 - today + b.dia_de_cobro
    return daysA - daysB
  })
}

// Formatea moneda MXN
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatea fecha corta
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })
}

// Formatea fecha completa
export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Calcula balance por cuenta (con balance inicial de BD)
// Incluye transferencias: salidas restan, entradas suman
export function calculateBalancesByCuenta(
  transactions: Transaction[],
  cuentasDB: CuentaDB[]
): CuentaBalance[] {
  return CUENTAS.map((cuenta) => {
    const cuentaTransactions = transactions.filter((t) => t.cuenta === cuenta)
    const cuentaInfo = cuentasDB.find((c) => c.nombre === cuenta)

    const ingresos = cuentaTransactions
      .filter((t) => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + Number(t.monto), 0)

    const gastos = cuentaTransactions
      .filter((t) => t.tipo === 'gasto')
      .reduce((sum, t) => sum + Number(t.monto), 0)

    // Transferencias que SALEN de esta cuenta (resta)
    const transferenciasOut = cuentaTransactions
      .filter((t) => t.tipo === 'transferencia')
      .reduce((sum, t) => sum + Number(t.monto), 0)

    // Transferencias que ENTRAN a esta cuenta (suma)
    const transferenciasIn = transactions
      .filter((t) => t.tipo === 'transferencia' && t.cuenta_destino === cuenta)
      .reduce((sum, t) => sum + Number(t.monto), 0)

    const balanceInicial = cuentaInfo?.balance_inicial ?? 0
    const balanceTransacciones = ingresos - gastos - transferenciasOut + transferenciasIn

    return {
      cuenta,
      balance: balanceInicial + balanceTransacciones,
      balanceInicial,
      ingresos,
      gastos,
      tipo: cuentaInfo?.tipo ?? 'debito',
      color: cuentaInfo?.color ?? 'gray',
    }
  })
}

// Calcula balance total sumando todas las cuentas
export function calculateBalanceTotal(cuentaBalances: CuentaBalance[]): number {
  return cuentaBalances.reduce((sum, c) => sum + c.balance, 0)
}
