import { NextRequest, NextResponse } from 'next/server'
import { prestarHerramienta } from '@/actions'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await prestarHerramienta(body.herramientaId, body.personalId, body.observaciones)
  return NextResponse.json(result)
}
