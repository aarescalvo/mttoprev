import { NextResponse } from 'next/server'
import { getEquipos, createEquipo } from '@/actions'
import { NextRequest } from 'next/server'

export async function GET() {
  const result = await getEquipos()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createEquipo(body)
  return NextResponse.json(result)
}
