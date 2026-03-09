import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar movimientos de stock
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const materialId = searchParams.get('materialId')
    const tipo = searchParams.get('tipo')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (materialId) where.materialId = materialId
    if (tipo) where.tipo = tipo

    const movimientos = await db.movimientoStock.findMany({
      where,
      include: {
        material: true,
        centroCosto: true
      },
      take: limit,
      orderBy: { fecha: 'desc' }
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error('Error al obtener movimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}

// POST - Crear movimiento de stock
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Obtener material actual
    const material = await db.material.findUnique({
      where: { id: data.materialId }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    const cantidad = parseFloat(data.cantidad)
    let stockNuevo = material.stockActual

    if (data.tipo === 'ENTRADA') {
      stockNuevo += cantidad
    } else if (data.tipo === 'SALIDA') {
      if (material.stockActual < cantidad) {
        return NextResponse.json(
          { error: 'Stock insuficiente' },
          { status: 400 }
        )
      }
      stockNuevo -= cantidad
    } else if (data.tipo === 'AJUSTE') {
      stockNuevo = cantidad
    }

    // Crear movimiento y actualizar stock
    const [movimiento] = await db.$transaction([
      db.movimientoStock.create({
        data: {
          materialId: data.materialId,
          tipo: data.tipo,
          cantidad: cantidad,
          motivo: data.motivo,
          referencia: data.referencia,
          stockAnterior: material.stockActual,
          stockNuevo: stockNuevo,
          centroCostoId: data.centroCostoId || null,
          usuario: data.usuario
        },
        include: {
          material: true,
          centroCosto: true
        }
      }),
      db.material.update({
        where: { id: data.materialId },
        data: { stockActual: stockNuevo }
      })
    ])

    return NextResponse.json(movimiento)
  } catch (error) {
    console.error('Error al crear movimiento:', error)
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    )
  }
}
