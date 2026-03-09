import { NextRequest, NextResponse } from 'next/server'
import { getSolicitudes, createSolicitud } from '@/actions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const filtros = {
    estado: searchParams.get('estado') || undefined,
    areaId: searchParams.get('areaId') || undefined,
  }
  const result = await getSolicitudes(filtros)
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createSolicitud(body)
  return NextResponse.json(result)
}
