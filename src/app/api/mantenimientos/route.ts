import { NextResponse } from 'next/server'
import { getMantenimientosPreventivos, createMantenimientoPreventivo } from '@/actions'
import { NextRequest } from 'next/server'

export async function GET() {
  const result = await getMantenimientosPreventivos()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createMantenimientoPreventivo(body)
  return NextResponse.json(result)
}
