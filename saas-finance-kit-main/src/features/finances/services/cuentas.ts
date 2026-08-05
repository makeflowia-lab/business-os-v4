import { createClient } from '@/lib/supabase/client'
import { CuentaDB } from '../types'

const supabase = createClient()

export async function fetchCuentas(): Promise<CuentaDB[]> {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('activa', true)
    .order('nombre')

  if (error) {
    console.error('Error fetching cuentas:', error)
    throw error
  }

  return (data || []).map((cuenta) => ({
    ...cuenta,
    balance_inicial: Number(cuenta.balance_inicial),
  }))
}

export async function updateCuentaBalanceInicial(
  id: string,
  balanceInicial: number
): Promise<CuentaDB> {
  const { data, error } = await supabase
    .from('cuentas')
    .update({ balance_inicial: balanceInicial, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating cuenta:', error)
    throw error
  }

  return {
    ...data,
    balance_inicial: Number(data.balance_inicial),
  }
}
