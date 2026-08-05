import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: transacciones, error } = await supabase
      .from('transacciones')
      .select('fecha_hora, tipo, monto')
      .order('fecha_hora', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!transacciones || transacciones.length === 0) {
      return NextResponse.json({ meses: [] })
    }

    const mesesMap = new Map<
      string,
      {
        anio: number
        mes: number
        nombreMes: string
        totalTransacciones: number
        totalIngresos: number
        totalGastos: number
        balance: number
      }
    >()

    transacciones.forEach((t) => {
      const fecha = new Date(t.fecha_hora)
      const anio = fecha.getFullYear()
      const mes = fecha.getMonth() + 1
      const key = `${anio}-${mes.toString().padStart(2, '0')}`

      if (!mesesMap.has(key)) {
        const nombreMes = fecha.toLocaleDateString('es-MX', {
          month: 'long',
          year: 'numeric',
        })
        mesesMap.set(key, {
          anio,
          mes,
          nombreMes,
          totalTransacciones: 0,
          totalIngresos: 0,
          totalGastos: 0,
          balance: 0,
        })
      }

      const mesData = mesesMap.get(key)!
      mesData.totalTransacciones++

      const monto = Number(t.monto) || 0
      if (t.tipo === 'ingreso') {
        mesData.totalIngresos += monto
      } else {
        mesData.totalGastos += monto
      }
      mesData.balance = mesData.totalIngresos - mesData.totalGastos
    })

    const meses = Array.from(mesesMap.values()).sort((a, b) => {
      if (a.anio !== b.anio) return b.anio - a.anio
      return b.mes - a.mes
    })

    return NextResponse.json({ meses })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
