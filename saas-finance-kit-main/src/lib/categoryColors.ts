/**
 * Sistema centralizado de categorías y colores
 * FUENTE ÚNICA DE VERDAD para toda la app
 */

// ===== CATEGORÍAS DE GASTOS =====
export const EXPENSE_CATEGORIES = [
  'Nomina',
  'Equipo',
  'Renta',
  'Software',
  'Marketing',
  'Transporte',
  'Comida',
  'Entretenimiento',
  'Otros',
] as const

// ===== CATEGORÍAS DE INGRESOS =====
export const INCOME_CATEGORIES = [
  'AlquimIA',
  'SaaS Factory LT',
  'Consultoría HT',
  'Infoproducto DIY MT',
] as const

// ===== CATEGORÍA DE TRANSFERENCIAS =====
export const TRANSFER_CATEGORY = 'Transferencia' as const

// Types derivados
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]
export type TransferCategory = typeof TRANSFER_CATEGORY

// ===== COLORES POR CATEGORÍA =====
export const CATEGORY_COLORS: Record<string, string> = {
  // Gastos
  Nomina: '#6366F1',           // Índigo
  Equipo: '#0EA5E9',           // Sky
  Renta: '#EF4444',            // Rojo
  Software: '#8B5CF6',         // Morado
  Marketing: '#F59E0B',        // Ámbar
  Transporte: '#14B8A6',       // Teal
  Comida: '#22C55E',           // Verde
  Entretenimiento: '#EC4899',  // Pink
  Otros: '#94A3B8',            // Gris

  // Ingresos
  'AlquimIA': '#F97316',           // Naranja
  'SaaS Factory LT': '#8B5CF6',    // Morado
  'Consultoría HT': '#FBBF24',     // Amarillo
  'Infoproducto DIY MT': '#94A3B8', // Gris

  // Transferencias (azul medio entre rojo y verde)
  'Transferencia': '#0EA5E9',      // Sky blue
}

export const DEFAULT_CATEGORY_COLOR = '#6B7280'

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLOR
}
