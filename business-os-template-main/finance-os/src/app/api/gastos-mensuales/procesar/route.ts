import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface GastoMensual {
  id: string
  nombre_app: string
  categoria: string
  cuenta: string | null
  dia_de_cobro: number
  monto: number
  activo: boolean
}

interface ResultadoProcesamiento {
  procesados: number
  omitidos: number
  detalles: {
    nombre: string
    razon: 'procesado' | 'ya_existe' | 'fecha_futura' | 'inactivo'
    fecha?: string
    monto?: number
  }[]
}

export async function POST(): Promise<NextResponse<ResultadoProcesamiento | { error: string }>> {
  const supabase = await createClient()

  // Obtener todos los gastos mensuales activos
  const { data: gastos, error: fetchError } = await supabase
    .from('gastos_mensuales')
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

  for (const gasto of gastos as GastoMensual[]) {
    // Calcular fecha de cobro para este mes
    const diaCobro = Math.min(gasto.dia_de_cobro, getDaysInMonth(anioActual, mesActual))
    const fechaCobro = new Date(anioActual, mesActual - 1, diaCobro)
    const fechaCobroStr = fechaCobro.toISOString().split('T')[0]

    // Si la fecha de cobro aun no ha llegado, omitir
    if (diaCobro > diaActual) {
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_app,
        razon: 'fecha_futura',
        fecha: fechaCobroStr,
      })
      continue
    }

    // Verificar si ya existe una transaccion para este gasto en este mes
    const inicioMes = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`
    const finMes = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(getDaysInMonth(anioActual, mesActual)).padStart(2, '0')}`

    // Buscar con el nombre exacto que se usará en la descripción
    const descripcionRecurrente = `${gasto.nombre_app} (recurrente)`
    const { data: existente } = await supabase
      .from('transacciones')
      .select('id')
      .eq('tipo', 'gasto')
      .eq('descripcion', descripcionRecurrente)
      .gte('fecha_hora', `${inicioMes}T00:00:00`)
      .lte('fecha_hora', `${finMes}T23:59:59`)
      .limit(1)

    if (existente && existente.length > 0) {
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_app,
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
      cuenta: gasto.cuenta || 'Primary Checking',
      descripcion: descripcionRecurrente,
      fecha_hora: `${fechaCobroStr}T12:00:00`,
    })

    if (insertError) {
      console.error(`Error al crear transaccion para ${gasto.nombre_app}:`, insertError)
      resultado.omitidos++
      resultado.detalles.push({
        nombre: gasto.nombre_app,
        razon: 'ya_existe', // Fallback
        fecha: fechaCobroStr,
      })
      continue
    }

    resultado.procesados++
    resultado.detalles.push({
      nombre: gasto.nombre_app,
      razon: 'procesado',
      fecha: fechaCobroStr,
      monto: gasto.monto,
    })
  }

  return NextResponse.json(resultado)
}

// Helper para obtener dias en el mes
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
