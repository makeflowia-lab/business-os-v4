export type IndustryType =
  | 'dental'
  | 'saas'
  | 'retail'
  | 'restaurant'
  | 'ecommerce'
  | 'services'
  | 'manufacturing'
  | 'other'

export interface FinancialInputs {
  // Financials
  monthlyRevenue: number
  fixedCosts: number
  variableCosts: number
  currentCash: number

  // Growth
  marketingBudget: number
  newCustomersMonthly: number
  churnRate: number // percentage (0-100)
  averageTicket: number
  customerLifetimeMonths: number

  // Operations
  totalEmployees: number
  totalPayroll: number
  wastePercentage: number // percentage (0-100)

  // Industry
  industry: IndustryType
  businessName: string
}

export type MetricStatus = 'critical' | 'warning' | 'healthy'

export interface Metric {
  id: string
  name: string
  value: number
  formattedValue: string
  status: MetricStatus
  description: string
  benchmark?: string
  impact?: string
}

export interface CalculatedMetrics {
  // Phase 1: Survival
  netProfitMargin: Metric
  breakEvenPoint: Metric
  runwayDays: Metric

  // Phase 2: Growth
  retentionRate: Metric
  cac: Metric
  ltv: Metric
  ltvCacRatio: Metric

  // Phase 3: Efficiency
  revenuePerEmployee: Metric
  laborCostRatio: Metric
  wasteImpact: Metric
}

export interface WizardStep {
  id: number
  title: string
  description: string
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Finanzas', description: 'Ingresos y gastos mensuales' },
  { id: 2, title: 'Crecimiento', description: 'Marketing y adquisición de clientes' },
  { id: 3, title: 'Operaciones', description: 'Equipo y eficiencia' },
  { id: 4, title: 'Industria', description: 'Contexto de tu negocio' },
]

export const INDUSTRY_OPTIONS = [
  { value: 'dental', label: 'Clínica Dental' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'retail', label: 'Retail / Tienda' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'services', label: 'Servicios Profesionales' },
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'other', label: 'Otro' },
]

export const INDUSTRY_BENCHMARKS: Record<IndustryType, { margin: number; laborRatio: number }> = {
  dental: { margin: 22, laborRatio: 30 },
  saas: { margin: 20, laborRatio: 40 },
  retail: { margin: 5, laborRatio: 15 },
  restaurant: { margin: 6, laborRatio: 35 },
  ecommerce: { margin: 10, laborRatio: 10 },
  services: { margin: 15, laborRatio: 50 },
  manufacturing: { margin: 8, laborRatio: 25 },
  other: { margin: 15, laborRatio: 30 },
}

export const DEFAULT_INPUTS: FinancialInputs = {
  monthlyRevenue: 0,
  fixedCosts: 0,
  variableCosts: 0,
  currentCash: 0,
  marketingBudget: 0,
  newCustomersMonthly: 0,
  churnRate: 0,
  averageTicket: 0,
  customerLifetimeMonths: 12,
  totalEmployees: 1,
  totalPayroll: 0,
  wastePercentage: 0,
  industry: 'other',
  businessName: '',
}
