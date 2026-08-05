import { CalculatedMetrics, FinancialInputs } from '@/features/calculator/types'
import { Transaction, GastoMensual, GastoAnual, FinanceKPIs } from '../types'
import { summarizeByCategory, formatCurrency } from './analytics'

export interface EnrichedContext {
  calculator: {
    metrics: CalculatedMetrics
    inputs: FinancialInputs
  } | null
  finances: {
    kpis: FinanceKPIs
    transactions: Transaction[]
    gastosMensuales: GastoMensual[]
    gastosAnuales: GastoAnual[]
  } | null
}

export function buildEnrichedContext(data: EnrichedContext): string {
  const sections: string[] = []

  // Seccion Calculator
  if (data.calculator?.metrics && data.calculator?.inputs) {
    const { metrics, inputs } = data.calculator
    sections.push(`
DATOS DEL NEGOCIO:
- Nombre: ${inputs.businessName || 'Sin nombre'}
- Industria: ${inputs.industry}
- Ingresos mensuales proyectados: ${formatCurrency(inputs.monthlyRevenue)}
- Gastos fijos: ${formatCurrency(inputs.fixedCosts)}
- Gastos variables: ${formatCurrency(inputs.variableCosts)}
- Efectivo disponible: ${formatCurrency(inputs.currentCash)}
- Empleados: ${inputs.totalEmployees}
- Nomina mensual: ${formatCurrency(inputs.totalPayroll)}

METRICAS DE SALUD FINANCIERA:
- Margen de beneficio neto: ${metrics.netProfitMargin.formattedValue} (${metrics.netProfitMargin.status})
- Punto de equilibrio: ${metrics.breakEvenPoint.formattedValue} (${metrics.breakEvenPoint.status})
- Runway: ${metrics.runwayDays.formattedValue} (${metrics.runwayDays.status})
- Retencion de clientes: ${metrics.retentionRate.formattedValue} (${metrics.retentionRate.status})
- CAC: ${metrics.cac.formattedValue} (${metrics.cac.status})
- LTV: ${metrics.ltv.formattedValue} (${metrics.ltv.status})
- Ratio LTV:CAC: ${metrics.ltvCacRatio.formattedValue} (${metrics.ltvCacRatio.status})
- Ingreso por empleado: ${metrics.revenuePerEmployee.formattedValue} (${metrics.revenuePerEmployee.status})
- Ratio costo laboral: ${metrics.laborCostRatio.formattedValue} (${metrics.laborCostRatio.status})
- Impacto de merma: ${metrics.wasteImpact.formattedValue} (${metrics.wasteImpact.status})
    `.trim())
  }

  // Seccion Finanzas Reales
  if (data.finances) {
    const { kpis, transactions, gastosMensuales, gastosAnuales } = data.finances

    if (transactions.length > 0) {
      const topGastos = summarizeByCategory(transactions, 'gasto').slice(0, 5)
      const topIngresos = summarizeByCategory(transactions, 'ingreso').slice(0, 3)

      sections.push(`
TRANSACCIONES REALES (periodo actual):
- Total Ingresos: ${formatCurrency(kpis.totalIngresos)}
- Total Gastos: ${formatCurrency(kpis.totalGastos)}
- Balance: ${formatCurrency(kpis.balance)}
- Numero de transacciones: ${kpis.transaccionesCount}

TOP CATEGORIAS DE GASTO:
${topGastos.map((c, i) => `${i + 1}. ${c.categoria}: ${formatCurrency(c.total)} (${c.porcentaje.toFixed(1)}%)`).join('\n')}

TOP FUENTES DE INGRESO:
${topIngresos.map((c, i) => `${i + 1}. ${c.categoria}: ${formatCurrency(c.total)} (${c.porcentaje.toFixed(1)}%)`).join('\n')}
      `.trim())
    }

    // Gastos recurrentes
    const totalMensual = gastosMensuales
      .filter(g => g.activo)
      .reduce((sum, g) => sum + Number(g.monto), 0)

    const totalAnual = gastosAnuales
      .filter(g => g.activo)
      .reduce((sum, g) => sum + Number(g.monto), 0)

    if (gastosMensuales.length > 0 || gastosAnuales.length > 0) {
      sections.push(`
GASTOS RECURRENTES:
- Total Mensuales: ${formatCurrency(totalMensual)} (${gastosMensuales.filter(g => g.activo).length} servicios)
- Total Anuales: ${formatCurrency(totalAnual)} (${formatCurrency(totalAnual / 12)}/mes prorrateado)
- Carga recurrente mensual total: ${formatCurrency(totalMensual + totalAnual / 12)}

Servicios mensuales activos:
${gastosMensuales.filter(g => g.activo).slice(0, 5).map(g => `- ${g.nombre_app}: ${formatCurrency(Number(g.monto))} (dia ${g.dia_de_cobro})`).join('\n')}
      `.trim())
    }

    // Alertas inteligentes
    const alerts: string[] = []

    if (kpis.balance < 0) {
      alerts.push('ALERTA: Balance negativo en el periodo')
    }

    if (kpis.totalGastos > kpis.totalIngresos * 0.9) {
      alerts.push('ALERTA: Gastos superan el 90% de ingresos')
    }

    if (totalMensual > kpis.totalIngresos * 0.3 && kpis.totalIngresos > 0) {
      alerts.push('ALERTA: Gastos recurrentes superan 30% de ingresos')
    }

    if (alerts.length > 0) {
      sections.push(`
ALERTAS:
${alerts.map(a => `⚠️ ${a}`).join('\n')}
      `.trim())
    }
  }

  if (sections.length === 0) {
    return 'No hay datos financieros disponibles todavia. El usuario aun no ha completado el wizard ni registrado transacciones.'
  }

  return sections.join('\n\n---\n\n')
}

// Helper para usar en el ChatInterface
export function buildContextFromStores(
  calculatorData: { metrics: CalculatedMetrics | null; inputs: FinancialInputs } | null,
  financesData: {
    kpis: FinanceKPIs
    transactions: Transaction[]
    gastosMensuales: GastoMensual[]
    gastosAnuales: GastoAnual[]
  } | null
): string {
  return buildEnrichedContext({
    calculator: calculatorData?.metrics ? {
      metrics: calculatorData.metrics,
      inputs: calculatorData.inputs,
    } : null,
    finances: financesData,
  })
}
