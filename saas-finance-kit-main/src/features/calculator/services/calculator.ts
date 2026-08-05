import {
  FinancialInputs,
  CalculatedMetrics,
  Metric,
  MetricStatus,
  INDUSTRY_BENCHMARKS,
} from '../types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatDays(value: number): string {
  return `${Math.round(value)} días`
}

function formatRatio(value: number): string {
  return `${value.toFixed(1)}:1`
}

function getMarginStatus(margin: number, industryBenchmark: number): MetricStatus {
  if (margin < industryBenchmark * 0.5) return 'critical'
  if (margin < industryBenchmark * 0.8) return 'warning'
  return 'healthy'
}

function getRunwayStatus(days: number): MetricStatus {
  if (days < 30) return 'critical'
  if (days < 60) return 'warning'
  return 'healthy'
}

function getLtvCacStatus(ratio: number): MetricStatus {
  if (ratio < 1) return 'critical'
  if (ratio < 3) return 'warning'
  return 'healthy'
}

function getLaborStatus(ratio: number, industryBenchmark: number): MetricStatus {
  if (ratio > industryBenchmark * 1.3) return 'critical'
  if (ratio > industryBenchmark * 1.1) return 'warning'
  return 'healthy'
}

export function calculateMetrics(inputs: FinancialInputs): CalculatedMetrics {
  const benchmark = INDUSTRY_BENCHMARKS[inputs.industry]

  // === PHASE 1: SURVIVAL ===

  // Net Profit Margin
  const totalExpenses = inputs.fixedCosts + inputs.variableCosts
  const netProfit = inputs.monthlyRevenue - totalExpenses
  const netProfitMargin = inputs.monthlyRevenue > 0
    ? (netProfit / inputs.monthlyRevenue) * 100
    : 0

  // Break-Even Point
  const grossMargin = inputs.monthlyRevenue > 0
    ? ((inputs.monthlyRevenue - inputs.variableCosts) / inputs.monthlyRevenue)
    : 0
  const breakEvenRevenue = grossMargin > 0
    ? inputs.fixedCosts / grossMargin
    : 0
  const breakEvenDays = inputs.monthlyRevenue > 0
    ? (breakEvenRevenue / inputs.monthlyRevenue) * 30
    : 30

  // Runway / Cash Flow
  const monthlyBurnRate = netProfit < 0 ? Math.abs(netProfit) : 0
  const runwayDays = monthlyBurnRate > 0
    ? (inputs.currentCash / monthlyBurnRate) * 30
    : netProfit >= 0 ? 365 : 0

  // === PHASE 2: GROWTH ===

  // Customer Retention Rate
  const retentionRate = 100 - inputs.churnRate
  const monthlyChurnedRevenue = inputs.monthlyRevenue * (inputs.churnRate / 100)

  // CAC (Customer Acquisition Cost)
  const cac = inputs.newCustomersMonthly > 0
    ? inputs.marketingBudget / inputs.newCustomersMonthly
    : 0

  // LTV (Lifetime Value)
  const ltv = inputs.averageTicket * inputs.customerLifetimeMonths * (retentionRate / 100)

  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0

  // === PHASE 3: EFFICIENCY ===

  // Revenue Per Employee
  const revenuePerEmployee = inputs.totalEmployees > 0
    ? inputs.monthlyRevenue / inputs.totalEmployees
    : 0

  // Labor Cost Ratio
  const laborCostRatio = inputs.monthlyRevenue > 0
    ? (inputs.totalPayroll / inputs.monthlyRevenue) * 100
    : 0

  // Waste Impact
  const annualWasteImpact = (inputs.monthlyRevenue * 12) * (inputs.wastePercentage / 100)

  return {
    // Phase 1: Survival
    netProfitMargin: {
      id: 'net-profit-margin',
      name: 'Margen de Beneficio Neto',
      value: netProfitMargin,
      formattedValue: formatPercentage(netProfitMargin),
      status: getMarginStatus(netProfitMargin, benchmark.margin),
      description: 'Porcentaje de ganancia después de todos los gastos',
      benchmark: `Industria: ${benchmark.margin}%`,
      impact: netProfitMargin < benchmark.margin
        ? `Estás ${(benchmark.margin - netProfitMargin).toFixed(1)}% por debajo del benchmark`
        : `Estás ${(netProfitMargin - benchmark.margin).toFixed(1)}% por encima del benchmark`,
    },
    breakEvenPoint: {
      id: 'break-even',
      name: 'Punto de Equilibrio',
      value: breakEvenDays,
      formattedValue: formatDays(breakEvenDays),
      status: breakEvenDays <= 20 ? 'healthy' : breakEvenDays <= 25 ? 'warning' : 'critical',
      description: 'Días del mes hasta cubrir gastos fijos',
      benchmark: 'Meta: día 20 del mes',
      impact: breakEvenDays > 30
        ? 'No alcanzas el punto de equilibrio este mes'
        : `Alcanzas equilibrio el día ${Math.round(breakEvenDays)}`,
    },
    runwayDays: {
      id: 'runway',
      name: 'Runway (Pista de Efectivo)',
      value: runwayDays,
      formattedValue: runwayDays >= 365 ? 'Rentable' : formatDays(runwayDays),
      status: getRunwayStatus(runwayDays),
      description: 'Días de operación con efectivo actual',
      benchmark: 'Mínimo: 90 días',
      impact: runwayDays < 30
        ? 'ALERTA: Menos de 30 días de efectivo'
        : runwayDays >= 365
          ? 'Negocio rentable, sin quema de efectivo'
          : `${Math.round(runwayDays)} días antes de quedarte sin efectivo`,
    },

    // Phase 2: Growth
    retentionRate: {
      id: 'retention',
      name: 'Tasa de Retención',
      value: retentionRate,
      formattedValue: formatPercentage(retentionRate),
      status: retentionRate >= 90 ? 'healthy' : retentionRate >= 80 ? 'warning' : 'critical',
      description: 'Clientes que permanecen mes a mes',
      benchmark: 'Meta: >90%',
      impact: `Pierdes ${formatCurrency(monthlyChurnedRevenue)}/mes por churn`,
    },
    cac: {
      id: 'cac',
      name: 'Costo de Adquisición (CAC)',
      value: cac,
      formattedValue: formatCurrency(cac),
      status: cac > 0 && ltv / cac >= 3 ? 'healthy' : cac > 0 && ltv / cac >= 1 ? 'warning' : 'critical',
      description: 'Costo promedio para adquirir un cliente',
      impact: `Inviertes ${formatCurrency(cac)} por cada nuevo cliente`,
    },
    ltv: {
      id: 'ltv',
      name: 'Valor de Vida del Cliente (LTV)',
      value: ltv,
      formattedValue: formatCurrency(ltv),
      status: ltv > cac * 3 ? 'healthy' : ltv > cac ? 'warning' : 'critical',
      description: 'Ingreso total esperado por cliente',
      impact: `Cada cliente genera ${formatCurrency(ltv)} en su vida`,
    },
    ltvCacRatio: {
      id: 'ltv-cac',
      name: 'Ratio LTV:CAC',
      value: ltvCacRatio,
      formattedValue: formatRatio(ltvCacRatio),
      status: getLtvCacStatus(ltvCacRatio),
      description: 'Eficiencia de inversión en adquisición',
      benchmark: 'Saludable: >3:1',
      impact: ltvCacRatio < 3
        ? 'Crecimiento ineficiente - cada cliente no paga su adquisición'
        : 'Crecimiento sostenible - buena eficiencia de marketing',
    },

    // Phase 3: Efficiency
    revenuePerEmployee: {
      id: 'revenue-employee',
      name: 'Ingreso por Empleado',
      value: revenuePerEmployee,
      formattedValue: formatCurrency(revenuePerEmployee),
      status: revenuePerEmployee > inputs.totalPayroll / inputs.totalEmployees * 2 ? 'healthy' : 'warning',
      description: 'Productividad promedio del equipo',
      impact: `Cada empleado genera ${formatCurrency(revenuePerEmployee)}/mes`,
    },
    laborCostRatio: {
      id: 'labor-ratio',
      name: 'Ratio Costo Laboral',
      value: laborCostRatio,
      formattedValue: formatPercentage(laborCostRatio),
      status: getLaborStatus(laborCostRatio, benchmark.laborRatio),
      description: 'Porcentaje de ingresos destinado a nómina',
      benchmark: `Industria: ${benchmark.laborRatio}%`,
      impact: laborCostRatio > benchmark.laborRatio
        ? `${(laborCostRatio - benchmark.laborRatio).toFixed(1)}% sobre el benchmark`
        : `${(benchmark.laborRatio - laborCostRatio).toFixed(1)}% bajo el benchmark`,
    },
    wasteImpact: {
      id: 'waste',
      name: 'Impacto de Merma/Desperdicio',
      value: annualWasteImpact,
      formattedValue: formatCurrency(annualWasteImpact) + '/año',
      status: inputs.wastePercentage <= 2 ? 'healthy' : inputs.wastePercentage <= 5 ? 'warning' : 'critical',
      description: 'Dinero perdido anualmente por ineficiencias',
      benchmark: 'Meta: <2%',
      impact: `Pierdes ${formatCurrency(annualWasteImpact)} al año en desperdicio`,
    },
  }
}

export function getOverallHealth(metrics: CalculatedMetrics): {
  score: number
  status: MetricStatus
  summary: string
} {
  const allMetrics = Object.values(metrics)
  const criticalCount = allMetrics.filter(m => m.status === 'critical').length
  const warningCount = allMetrics.filter(m => m.status === 'warning').length
  const healthyCount = allMetrics.filter(m => m.status === 'healthy').length

  const score = Math.round(
    ((healthyCount * 100) + (warningCount * 50)) / allMetrics.length
  )

  let status: MetricStatus = 'healthy'
  let summary = 'Tu negocio está en excelente forma'

  if (criticalCount >= 3) {
    status = 'critical'
    summary = 'Tu negocio necesita atención urgente'
  } else if (criticalCount >= 1 || warningCount >= 3) {
    status = 'warning'
    summary = 'Hay áreas de oportunidad importantes'
  }

  return { score, status, summary }
}
