import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface GastoAnual {
  id: string
  nombre_servicio: string
  categoria: string
  mes_de_cobro: number
  dia_de_cobro: number
  monto: number
  activo: boolean
}

interface ResultadoProcesamiento {
  procesados: number
  omitidos: number
  detalles: {
    nombre: string
    razon: 'procesado' | 'ya_existe' | 'fecha_futura' | 'mes_diferente'
    fecha?: string
    monto?: number
  }[]
}

export async function POST(): Promise<NextResponse<ResultadoProcesamiento | { error: string }>> {
  const supabase = await createClient()

  // Obtener todos los gastos anuales activos
  const { data: gastos, error: fetchError } = await supabase
    .from('gastos_anuales')
    .select('*')
    .eq('activo', true)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!gastos || gastos.length === 0) {
    return NextResponse.json({
      procesados: 0,
      omitidos: 0,
      detalles: [],
    })
  }

  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1
  const diaActual = hoy.getDate()

  const resultado: ResultadoProcesamiento = {
    procesados: 0,
    omitidos: 0,
    detalles: [],
  }

  for (const gasto of gastos as GastoAnual[]) {
    // Si no es el mes de cobro, omitir
    if (gasto.mes_de_cobro !== mesActual) {
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_servicio,
        razon: 'mes_diferente',
      })
      continue
    }

    // Calcular fecha de cobro
    const diaCobro = Math.min(gasto.dia_de_cobro, getDaysInMonth(anioActual, mesActual))
    const fechaCobro = new Date(anioActual, mesActual - 1, diaCobro)
    const fechaCobroStr = fechaCobro.toISOString().split('T')[0]

    // Si la fecha de cobro aun no ha llegado, omitir
    if (diaCobro > diaActual) {
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_servicio,
        razon: 'fecha_futura',
        fecha: fechaCobroStr,
      })
      continue
    }

    // Verificar si ya existe una transaccion para este gasto en este anio
    const inicioAnio = `${anioActual}-01-01`
    const finAnio = `${anioActual}-12-31`

    const { data: existente } = await supabase
      .from('transacciones')
      .select('id')
      .eq('tipo', 'gasto')
      .eq('categoria', gasto.categoria)
      .eq('monto', gasto.monto)
      .ilike('descripcion', `%${gasto.nombre_servicio}%`)
      .gte('fecha_hora', `${inicioAnio}T00:00:00`)
      .lte('fecha_hora', `${finAnio}T23:59:59`)
      .limit(1)

    if (existente && existente.length > 0) {
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_servicio,
        razon: 'ya_existe',
        fecha: fechaCobroStr,
      })
      continue
    }

    // Crear la transaccion
    const { error: insertError } = await supabase.from('transacciones').insert({
      tipo: 'gasto',
      monto: gasto.monto,
      categoria: gasto.categoria,
      descripcion: `${gasto.nombre_servicio} (anual)`,
      fecha_hora: `${fechaCobroStr}T12:00:00`,
    })

    if (insertError) {
      console.error(`Error al crear transaccion para ${gasto.nombre_servicio}:`, insertError)
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_servicio,
        razon: 'ya_existe',
        fecha: fechaCobroStr,
      })
      continue
    }

    resultado.procesados++
    resultado.detalles.push({
      nombre: gasto.nombre_servicio,
      razon: 'procesado',
      fecha: fechaCobroStr,
      monto: gasto.monto,
    })
  }

  return NextResponse.json(resultado)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
