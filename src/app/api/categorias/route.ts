import { NextResponse } from 'next/server'
import { getCategorias } from '@/actions'

export async function GET() {
  const result = await getCategorias()
  return NextResponse.json(result)
}
