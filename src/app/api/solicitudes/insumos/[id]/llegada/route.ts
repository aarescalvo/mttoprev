import { NextRequest, NextResponse } from 'next/server'
import { registrarLlegadaInsumo } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await registrarLlegadaInsumo(
    id,
    body.cantidadRecibida,
    body.recibidoPor || 'Sistema',
    body.observaciones
  )
  return NextResponse.json(result)
}
