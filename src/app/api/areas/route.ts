import { NextResponse } from 'next/server'
import { getAreas } from '@/actions'

export async function GET() {
  const result = await getAreas()
  return NextResponse.json(result)
}
