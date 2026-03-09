import { NextRequest, NextResponse } from 'next/server'
import { createMovimientoStock } from '@/actions'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createMovimientoStock(body)
  return NextResponse.json(result)
}
