import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un área
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const area = await db.area.findUnique({
      where: { id },
      include: {
        equipos: {
          where: { activo: true },
          take: 20
        },
        personal: {
          where: { activo: true }
        },
        solicitudes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { equipo: true }
        }
      }
    })

    if (!area) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error al obtener área:', error)
    return NextResponse.json(
      { error: 'Error al obtener área' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar área
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existe = await db.area.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    if (data.codigo && data.codigo !== existe.codigo) {
      const codigoExiste = await db.area.findUnique({
        where: { codigo: data.codigo }
      })
      if (codigoExiste) {
        return NextResponse.json(
          { error: 'Ya existe un área con ese código' },
          { status: 400 }
        )
      }
    }

    const area = await db.area.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion
      }
    })

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error al actualizar área:', error)
    return NextResponse.json(
      { error: 'Error al actualizar área' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar área
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existe = await db.area.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { equipos: true, personal: true }
        }
      }
    })

    if (!existe) {
      return NextResponse.json(
        { error: 'Área no encontrada' },
        { status: 404 }
      )
    }

    if (existe._count.equipos > 0 || existe._count.personal > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un área con equipos o personal asociado' },
        { status: 400 }
      )
    }

    await db.area.update({
      where: { id },
      data: { activo: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar área:', error)
    return NextResponse.json(
      { error: 'Error al eliminar área' },
      { status: 500 }
    )
  }
}
