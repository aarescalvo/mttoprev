import { NextRequest, NextResponse } from 'next/server'
import { getSolicitudById, deleteSolicitud } from '@/actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await getSolicitudById(id)
  return NextResponse.json(result)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteSolicitud(id)
  return NextResponse.json(result)
}
