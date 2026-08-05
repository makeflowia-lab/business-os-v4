import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const vista = searchParams.get('vista') || 'mensual'
  const fechaInicio = searchParams.get('fecha_inicio')
  const fechaFin = searchParams.get('fecha_fin')

  // Calcular rango de fechas
  const end = new Date()
  const start = new Date()

  switch (vista) {
    case 'diaria':
      start.setHours(0, 0, 0, 0)
      break
    case 'semanal':
      start.setDate(start.getDate() - 7)
      break
    case 'mensual':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'personalizada':
      if (fechaInicio) start.setTime(new Date(fechaInicio).getTime())
      if (fechaFin) end.setTime(new Date(fechaFin).getTime())
      break
  }

  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .gte('fecha_hora', start.toISOString())
    .lte('fecha_hora', end.toISOString())
    .order('fecha_hora', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { tipo, monto, categoria, descripcion, fecha_hora, cuenta, cuenta_destino } = body

  if (!tipo || !monto || !categoria) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos: tipo, monto, categoria' },
      { status: 400 }
    )
  }

  if (!['ingreso', 'gasto', 'transferencia'].includes(tipo)) {
    return NextResponse.json(
      { error: 'Tipo debe ser "ingreso", "gasto" o "transferencia"' },
      { status: 400 }
    )
  }

  // Validar que transferencias tengan cuenta_destino
  if (tipo === 'transferencia' && !cuenta_destino) {
    return NextResponse.json(
      { error: 'Las transferencias requieren cuenta_destino' },
      { status: 400 }
    )
  }

  // Validar que cuenta origen y destino sean diferentes
  if (tipo === 'transferencia' && cuenta === cuenta_destino) {
    return NextResponse.json(
      { error: 'La cuenta origen y destino deben ser diferentes' },
      { status: 400 }
    )
  }

  if (monto <= 0) {
    return NextResponse.json(
      { error: 'Monto debe ser mayor a 0' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('transacciones')
    .insert({
      tipo,
      monto,
      categoria,
      descripcion: descripcion || null,
      fecha_hora: fecha_hora || new Date().toISOString(),
      cuenta: cuenta || null,
      cuenta_destino: tipo === 'transferencia' ? cuenta_destino : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transacciones')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { error } = await supabase.from('transacciones').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
