'use client'

import { useState, useEffect, useCallback } from 'react'
import { Category } from '../types'
import { adminService } from '../services/adminService'

interface UseCategoriesReturn {
  expenseCategories: Category[]
  incomeCategories: Category[]
  isLoading: boolean
  error: string | null
  getCategoryColor: (name: string) => string
  refresh: () => Promise<void>
}

/**
 * Hook para cargar categorias dinamicas del usuario
 * Usa defaults si no hay config personalizada
 */
export function useCategories(): UseCategoriesReturn {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const config = await adminService.getUserConfig()
      setExpenseCategories(config.expense_categories)
      setIncomeCategories(config.income_categories)
    } catch (err) {
      // Si falla (no auth), usar defaults
      setExpenseCategories(adminService.getDefaultCategories('expense'))
      setIncomeCategories(adminService.getDefaultCategories('income'))
      setError(err instanceof Error ? err.message : 'Error al cargar categorias')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const getCategoryColor = useCallback((name: string): string => {
    const allCategories = [...expenseCategories, ...incomeCategories]
    const found = allCategories.find(c => c.name === name)
    return found?.color || '#6B7280'
  }, [expenseCategories, incomeCategories])

  return {
    expenseCategories,
    incomeCategories,
    isLoading,
    error,
    getCategoryColor,
    refresh: loadCategories,
  }
}
