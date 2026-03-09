import { NextRequest, NextResponse } from 'next/server'
import { agregarInsumoSolicitud } from '@/actions'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await agregarInsumoSolicitud(body)
  return NextResponse.json(result)
}
