import { createClient } from '@/lib/supabase/client'
import {
  Transaction,
  TransactionInput,
  GastoMensual,
  GastoMensualInput,
  GastoAnual,
  GastoAnualInput,
  VistaRango,
} from '../types'

const supabase = createClient()

// Helpers de fecha
function getDateRange(vista: VistaRango): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (vista) {
    case 'historico':
      // Traer todas las transacciones desde el inicio
      start.setFullYear(2020, 0, 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'mensual':
      // Últimos 30 días (no mes calendario)
      start.setDate(start.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      break
    case 'personalizada':
    default:
      start.setMonth(start.getMonth() - 1)
  }

  return { start, end }
}

// ============ TRANSACCIONES ============

export async function fetchTransactions(
  vista: VistaRango = 'mensual',
  customStart?: Date,
  customEnd?: Date
): Promise<Transaction[]> {
  const { start, end } =
    vista === 'personalizada' && customStart && customEnd
      ? { start: customStart, end: customEnd }
      : getDateRange(vista)

  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .gte('fecha_hora', start.toISOString())
    .lte('fecha_hora', end.toISOString())
    .order('fecha_hora', { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)
  return data || []
}

export async function createTransaction(
  input: TransactionInput
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transacciones')
    .insert({
      tipo: input.tipo,
      monto: input.monto,
      categoria: input.categoria,
      descripcion: input.descripcion || null,
      fecha_hora: input.fecha_hora || new Date().toISOString(),
      cuenta: input.cuenta,
      cuenta_destino: input.cuenta_destino || null,  // Para transferencias
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateTransaction(
  id: string,
  updates: Partial<TransactionInput>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transacciones')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transacciones').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

// ============ GASTOS MENSUALES ============

export async function fetchGastosMensuales(): Promise<GastoMensual[]> {
  const { data, error } = await supabase
    .from('gastos_mensuales')
    .select('*')
    .order('dia_de_cobro', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createGastoMensual(
  input: GastoMensualInput
): Promise<GastoMensual> {
  const { data, error } = await supabase
    .from('gastos_mensuales')
    .insert({
      nombre_app: input.nombre_app,
      categoria: input.categoria,
      dia_de_cobro: input.dia_de_cobro,
      monto: input.monto,
      activo: input.activo ?? true,
      cuenta: input.cuenta,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateGastoMensual(
  id: string,
  updates: Partial<GastoMensualInput>
): Promise<GastoMensual> {
  const { data, error } = await supabase
    .from('gastos_mensuales')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteGastoMensual(id: string): Promise<void> {
  const { error } = await supabase.from('gastos_mensuales').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

// ============ GASTOS ANUALES ============

export async function fetchGastosAnuales(): Promise<GastoAnual[]> {
  const { data, error } = await supabase
    .from('gastos_anuales')
    .select('*')
    .order('mes_de_cobro', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createGastoAnual(
  input: GastoAnualInput
): Promise<GastoAnual> {
  const { data, error } = await supabase
    .from('gastos_anuales')
    .insert({
      nombre_servicio: input.nombre_servicio,
      categoria: input.categoria,
      mes_de_cobro: input.mes_de_cobro,
      dia_de_cobro: input.dia_de_cobro,
      monto: input.monto,
      activo: input.activo ?? true,
      cuenta: input.cuenta,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateGastoAnual(
  id: string,
  updates: Partial<GastoAnualInput>
): Promise<GastoAnual> {
  const { data, error } = await supabase
    .from('gastos_anuales')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteGastoAnual(id: string): Promise<void> {
  const { error } = await supabase.from('gastos_anuales').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
