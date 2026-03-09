import { NextResponse } from 'next/server'
import { getPersonal, createPersonal } from '@/actions'
import { NextRequest } from 'next/server'

export async function GET() {
  const result = await getPersonal()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await createPersonal(body)
  return NextResponse.json(result)
}
