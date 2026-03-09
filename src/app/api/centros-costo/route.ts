import { NextResponse } from 'next/server'
import { getCentrosCosto } from '@/actions'

export async function GET() {
  const result = await getCentrosCosto()
  return NextResponse.json(result)
}
