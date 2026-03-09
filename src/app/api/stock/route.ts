import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar todos los materiales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const busqueda = searchParams.get('busqueda')
    const categoriaId = searchParams.get('categoriaId')
    const centroCostoId = searchParams.get('centroCostoId')
    const stockBajo = searchParams.get('stockBajo')

    const where: any = { activo: true }

    if (busqueda) {
      where.OR = [
        { codigo: { contains: busqueda } },
        { nombre: { contains: busqueda } },
        { descripcion: { contains: busqueda } }
      ]
    }

    if (categoriaId) {
      where.categoriaId = categoriaId
    }

    if (centroCostoId) {
      where.centroCostoId = centroCostoId
    }

    if (stockBajo === 'true') {
      // SQLite no soporta comparación entre columnas directamente
      // así que obtenemos todos y filtramos en memoria
      const materiales = await db.material.findMany({
        where: { activo: true },
        include: {
          categoria: true,
          centroCosto: true
        },
        orderBy: { nombre: 'asc' }
      })
      
      const filtrados = materiales.filter(m => m.stockActual <= m.stockMinimo)
      return NextResponse.json(filtrados)
    }

    const materiales = await db.material.findMany({
      where,
      include: {
        categoria: true,
        centroCosto: true
      },
      orderBy: { nombre: 'asc' }
    })

    return NextResponse.json(materiales)
  } catch (error) {
    console.error('Error al obtener materiales:', error)
    return NextResponse.json(
      { error: 'Error al obtener materiales' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo material
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Verificar si el código ya existe
    const existe = await db.material.findUnique({
      where: { codigo: data.codigo }
    })

    if (existe) {
      return NextResponse.json(
        { error: 'Ya existe un material con ese código' },
        { status: 400 }
      )
    }

    const material = await db.material.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId || null,
        stockActual: parseFloat(data.stockActual) || 0,
        stockMinimo: parseFloat(data.stockMinimo) || 0,
        unidad: data.unidad || 'unidades',
        precio: data.precio ? parseFloat(data.precio) : null,
        ubicacion: data.ubicacion,
        centroCostoId: data.centroCostoId || null
      },
      include: {
        categoria: true,
        centroCosto: true
      }
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error('Error al crear material:', error)
    return NextResponse.json(
      { error: 'Error al crear material' },
      { status: 500 }
    )
  }
}
