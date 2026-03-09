import { NextRequest, NextResponse } from 'next/server'
import { updateMaterial, deleteMaterial } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await updateMaterial(id, body)
  return NextResponse.json(result)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteMaterial(id)
  return NextResponse.json(result)
}
