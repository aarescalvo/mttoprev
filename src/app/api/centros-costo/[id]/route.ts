import { NextRequest, NextResponse } from 'next/server'
import { updateCentroCosto, deleteCentroCosto } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await updateCentroCosto(id, body)
  return NextResponse.json(result)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await deleteCentroCosto(id)
  return NextResponse.json(result)
}
