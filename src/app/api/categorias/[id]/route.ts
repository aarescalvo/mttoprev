import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener una categoría
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const categoria = await db.categoriaMaterial.findUnique({
      where: { id },
      include: {
        materiales: {
          where: { activo: true },
          take: 50
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existe = await db.categoriaMaterial.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    if (data.nombre && data.nombre !== existe.nombre) {
      const nombreExiste = await db.categoriaMaterial.findUnique({
        where: { nombre: data.nombre }
      })
      if (nombreExiste) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre' },
          { status: 400 }
        )
      }
    }

    const categoria = await db.categoriaMaterial.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion
      }
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existe = await db.categoriaMaterial.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { materiales: true }
        }
      }
    })

    if (!existe) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    if (existe._count.materiales > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con materiales asociados' },
        { status: 400 }
      )
    }

    await db.categoriaMaterial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
