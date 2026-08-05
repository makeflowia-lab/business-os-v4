import { createClient } from '@/lib/supabase/client'
import { UserConfig, Category, CategoryType, CalculatorDefaults } from '../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '@/lib/categoryColors'

const supabase = createClient()

// Categorias default del sistema
const DEFAULT_EXPENSE_CATEGORIES: Category[] = EXPENSE_CATEGORIES.map(name => ({
  name,
  color: CATEGORY_COLORS[name] || '#6B7280'
}))

const DEFAULT_INCOME_CATEGORIES: Category[] = INCOME_CATEGORIES.map(name => ({
  name,
  color: CATEGORY_COLORS[name] || '#6B7280'
}))

export const adminService = {
  /**
   * Obtiene la config del usuario o crea una nueva con defaults
   */
  async getUserConfig(): Promise<UserConfig> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Intentar obtener config existente
    const { data, error } = await supabase
      .from('user_config')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    // Si existe, retornar (con defaults si arrays vacios)
    if (data) {
      return {
        ...data,
        expense_categories: data.expense_categories.length > 0
          ? data.expense_categories
          : DEFAULT_EXPENSE_CATEGORIES,
        income_categories: data.income_categories.length > 0
          ? data.income_categories
          : DEFAULT_INCOME_CATEGORIES,
      }
    }

    // Si no existe, crear nueva config
    const { data: newConfig, error: insertError } = await supabase
      .from('user_config')
      .insert({
        user_id: user.id,
        expense_categories: [],
        income_categories: [],
        agent_system_prompt: null,
        calculator_defaults: {},
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    return {
      ...newConfig,
      expense_categories: DEFAULT_EXPENSE_CATEGORIES,
      income_categories: DEFAULT_INCOME_CATEGORIES,
    }
  },

  /**
   * Actualiza categorias de un tipo
   */
  async updateCategories(type: CategoryType, categories: Category[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const field = type === 'expense' ? 'expense_categories' : 'income_categories'

    const { error } = await supabase
      .from('user_config')
      .update({
        [field]: categories,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  },

  /**
   * Actualiza el system prompt del agente
   */
  async updateAgentPrompt(prompt: string | null): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase
      .from('user_config')
      .update({
        agent_system_prompt: prompt,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  },

  /**
   * Actualiza defaults de la calculadora
   */
  async updateCalculatorDefaults(defaults: CalculatorDefaults): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase
      .from('user_config')
      .update({
        calculator_defaults: defaults,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  },

  /**
   * Resetea categorias a defaults
   */
  async resetCategories(type: CategoryType): Promise<Category[]> {
    const defaults = type === 'expense'
      ? DEFAULT_EXPENSE_CATEGORIES
      : DEFAULT_INCOME_CATEGORIES

    // Guardar array vacio (significa "usar defaults")
    await this.updateCategories(type, [])

    return defaults
  },

  /**
   * Obtiene categorias default del sistema
   */
  getDefaultCategories(type: CategoryType): Category[] {
    return type === 'expense'
      ? DEFAULT_EXPENSE_CATEGORIES
      : DEFAULT_INCOME_CATEGORIES
  }
}
