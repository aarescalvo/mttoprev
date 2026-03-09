import { NextRequest, NextResponse } from 'next/server'
import { updateEquipo, deleteEquipo } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await updateEquipo(id, body)
  return NextResponse.json(result)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteEquipo(id)
  return NextResponse.json(result)
}
