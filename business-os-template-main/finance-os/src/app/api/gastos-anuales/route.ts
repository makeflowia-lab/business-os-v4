import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gastos_anuales')
    .select('*')
    .order('mes_de_cobro', { ascending: true })
    .order('dia_de_cobro', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { nombre_servicio, categoria, mes_de_cobro, dia_de_cobro, monto, activo } = body

  if (!nombre_servicio || !categoria || !mes_de_cobro || !dia_de_cobro || !monto) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos' },
      { status: 400 }
    )
  }

  if (mes_de_cobro < 1 || mes_de_cobro > 12) {
    return NextResponse.json(
      { error: 'Mes de cobro debe estar entre 1 y 12' },
      { status: 400 }
    )
  }

  if (dia_de_cobro < 1 || dia_de_cobro > 31) {
    return NextResponse.json(
      { error: 'Dia de cobro debe estar entre 1 y 31' },
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
    .from('gastos_anuales')
    .insert({
      nombre_servicio,
      categoria,
      mes_de_cobro,
      dia_de_cobro,
      monto,
      activo: activo ?? true,
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

  if (updates.mes_de_cobro && (updates.mes_de_cobro < 1 || updates.mes_de_cobro > 12)) {
    return NextResponse.json(
      { error: 'Mes de cobro debe estar entre 1 y 12' },
      { status: 400 }
    )
  }

  if (updates.dia_de_cobro && (updates.dia_de_cobro < 1 || updates.dia_de_cobro > 31)) {
    return NextResponse.json(
      { error: 'Dia de cobro debe estar entre 1 y 31' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('gastos_anuales')
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

  const { error } = await supabase.from('gastos_anuales').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
