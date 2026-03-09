import { NextRequest, NextResponse } from 'next/server'
import { getMateriales, createMaterial } from '@/actions'

export async function GET() {
  const result = await getMateriales()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createMaterial(body)
  return NextResponse.json(result)
}
