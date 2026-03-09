import { NextRequest, NextResponse } from 'next/server'
import { updateHerramienta, deleteHerramienta } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await updateHerramienta(id, body)
  return NextResponse.json(result)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteHerramienta(id)
  return NextResponse.json(result)
}
