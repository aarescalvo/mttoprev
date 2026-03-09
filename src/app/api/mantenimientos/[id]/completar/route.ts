import { NextRequest, NextResponse } from 'next/server'
import { completarMantenimiento } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await completarMantenimiento(id, body)
  return NextResponse.json(result)
}
