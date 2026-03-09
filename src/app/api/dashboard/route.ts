import { NextResponse } from 'next/server'
import { getEstadisticasDashboard } from '@/actions'

export async function GET() {
  const result = await getEstadisticasDashboard()
  return NextResponse.json(result)
}
