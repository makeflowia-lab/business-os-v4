'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserConfig, Category, CategoryType, CalculatorDefaults } from '../types'
import { adminService } from '../services/adminService'

interface UseAdminConfigReturn {
  config: UserConfig | null
  isLoading: boolean
  error: string | null

  // Category actions
  updateCategories: (type: CategoryType, categories: Category[]) => Promise<void>
  addCategory: (type: CategoryType, category: Category) => Promise<void>
  removeCategory: (type: CategoryType, categoryName: string) => Promise<void>
  updateCategory: (type: CategoryType, oldName: string, updated: Category) => Promise<void>
  resetCategories: (type: CategoryType) => Promise<void>

  // Agent prompt actions
  updateAgentPrompt: (prompt: string | null) => Promise<void>

  // Calculator actions
  updateCalculatorDefaults: (defaults: CalculatorDefaults) => Promise<void>

  // Refresh
  refresh: () => Promise<void>
}

export function useAdminConfig(): UseAdminConfigReturn {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminService.getUserConfig()
      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar config')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const updateCategories = useCallback(async (type: CategoryType, categories: Category[]) => {
    if (!config) return
    try {
      await adminService.updateCategories(type, categories)
      setConfig(prev => prev ? {
        ...prev,
        [type === 'expense' ? 'expense_categories' : 'income_categories']: categories
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categorias')
      throw err
    }
  }, [config])

  const addCategory = useCallback(async (type: CategoryType, category: Category) => {
    if (!config) return
    const key = type === 'expense' ? 'expense_categories' : 'income_categories'
    const current = config[key]

    // Check if already exists
    if (current.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error('La categoria ya existe')
    }

    await updateCategories(type, [...current, category])
  }, [config, updateCategories])

  const removeCategory = useCallback(async (type: CategoryType, categoryName: string) => {
    if (!config) return
    const key = type === 'expense' ? 'expense_categories' : 'income_categories'
    const current = config[key]
    await updateCategories(type, current.filter(c => c.name !== categoryName))
  }, [config, updateCategories])

  const updateCategory = useCallback(async (type: CategoryType, oldName: string, updated: Category) => {
    if (!config) return
    const key = type === 'expense' ? 'expense_categories' : 'income_categories'
    const current = config[key]
    await updateCategories(type, current.map(c => c.name === oldName ? updated : c))
  }, [config, updateCategories])

  const resetCategories = useCallback(async (type: CategoryType) => {
    try {
      const defaults = await adminService.resetCategories(type)
      setConfig(prev => prev ? {
        ...prev,
        [type === 'expense' ? 'expense_categories' : 'income_categories']: defaults
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear categorias')
      throw err
    }
  }, [])

  const updateAgentPrompt = useCallback(async (prompt: string | null) => {
    try {
      await adminService.updateAgentPrompt(prompt)
      setConfig(prev => prev ? { ...prev, agent_system_prompt: prompt } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar prompt')
      throw err
    }
  }, [])

  const updateCalculatorDefaults = useCallback(async (defaults: CalculatorDefaults) => {
    try {
      await adminService.updateCalculatorDefaults(defaults)
      setConfig(prev => prev ? { ...prev, calculator_defaults: defaults } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar defaults')
      throw err
    }
  }, [])

  return {
    config,
    isLoading,
    error,
    updateCategories,
    addCategory,
    removeCategory,
    updateCategory,
    resetCategories,
    updateAgentPrompt,
    updateCalculatorDefaults,
    refresh: loadConfig,
  }
}
