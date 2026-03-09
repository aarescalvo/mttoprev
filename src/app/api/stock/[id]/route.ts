import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un material específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const material = await db.material.findUnique({
      where: { id },
      include: {
        categoria: true,
        centroCosto: true,
        movimientos: {
          take: 20,
          orderBy: { fecha: 'desc' },
          include: { centroCosto: true }
        }
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('Error al obtener material:', error)
    return NextResponse.json(
      { error: 'Error al obtener material' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Verificar si existe
    const existe = await db.material.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Si se cambia el código, verificar que no exista
    if (data.codigo && data.codigo !== existe.codigo) {
      const codigoExiste = await db.material.findUnique({
        where: { codigo: data.codigo }
      })
      if (codigoExiste) {
        return NextResponse.json(
          { error: 'Ya existe un material con ese código' },
          { status: 400 }
        )
      }
    }

    const material = await db.material.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId || null,
        stockActual: parseFloat(data.stockActual),
        stockMinimo: parseFloat(data.stockMinimo),
        unidad: data.unidad,
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
    console.error('Error al actualizar material:', error)
    return NextResponse.json(
      { error: 'Error al actualizar material' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar material (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si existe
    const existe = await db.material.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await db.material.update({
      where: { id },
      data: { activo: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar material:', error)
    return NextResponse.json(
      { error: 'Error al eliminar material' },
      { status: 500 }
    )
  }
}
