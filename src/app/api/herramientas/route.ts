import { NextResponse } from 'next/server'
import { getHerramientas, createHerramienta } from '@/actions'
import { NextRequest } from 'next/server'

export async function GET() {
  const result = await getHerramientas()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createHerramienta(body)
  return NextResponse.json(result)
}
