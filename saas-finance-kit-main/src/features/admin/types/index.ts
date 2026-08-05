// Tipos para Admin Panel

export interface Category {
  name: string
  color: string
}

export interface UserConfig {
  id: string
  user_id: string
  expense_categories: Category[]
  income_categories: Category[]
  agent_system_prompt: string | null
  calculator_defaults: CalculatorDefaults
  created_at: string
  updated_at: string
}

export interface CalculatorDefaults {
  monthlyRevenue?: number
  fixedCosts?: number
  variableCostPercent?: number
  taxRate?: number
  desiredProfit?: number
}

export type CategoryType = 'expense' | 'income'
