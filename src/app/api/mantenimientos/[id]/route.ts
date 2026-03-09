import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un mantenimiento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const mantenimiento = await db.mantenimientoPreventivo.findUnique({
      where: { id },
      include: {
        equipo: {
          include: { 
            area: true,
            tareasMantenimiento: { where: { activo: true } }
          }
        },
        centroCosto: true,
        checklist: {
          include: { tarea: true }
        }
      }
    })

    if (!mantenimiento) {
      return NextResponse.json(
        { error: 'Mantenimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(mantenimiento)
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error)
    return NextResponse.json(
      { error: 'Error al obtener mantenimiento' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar mantenimiento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const existe = await db.mantenimientoPreventivo.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Mantenimiento no encontrado' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (data.fechaProgramada) updateData.fechaProgramada = new Date(data.fechaProgramada)
    if (data.estado) updateData.estado = data.estado
    if (data.centroCostoId !== undefined) updateData.centroCostoId = data.centroCostoId || null

    // Si se completa el mantenimiento
    if (data.estado === 'COMPLETADO') {
      updateData.fechaEjecucion = new Date()
      updateData.trabajoRealizado = data.trabajoRealizado
      updateData.observaciones = data.observaciones
      updateData.ejecutadoPor = data.ejecutadoPor
      updateData.horasTrabajo = data.horasTrabajo ? parseFloat(data.horasTrabajo) : null
      updateData.costoMateriales = data.costoMateriales ? parseFloat(data.costoMateriales) : null
      updateData.costoManoObra = data.costoManoObra ? parseFloat(data.costoManoObra) : null

      // Actualizar equipo
      if (existe.equipoId) {
        const frecuencia = data.frecuenciaMantenimiento || 30
        const proximaFecha = new Date()
        proximaFecha.setDate(proximaFecha.getDate() + frecuencia)
        
        await db.equipo.update({
          where: { id: existe.equipoId },
          data: {
            ultimoMantenimiento: new Date(),
            proximoMantenimiento: proximaFecha
          }
        })
      }
    }

    const mantenimiento = await db.mantenimientoPreventivo.update({
      where: { id },
      data: updateData,
      include: {
        equipo: true,
        centroCosto: true
      }
    })

    return NextResponse.json(mantenimiento)
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error)
    return NextResponse.json(
      { error: 'Error al actualizar mantenimiento' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar mantenimiento (solo si está programado)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existe = await db.mantenimientoPreventivo.findUnique({
      where: { id },
      select: { estado: true }
    })

    if (!existe) {
      return NextResponse.json(
        { error: 'Mantenimiento no encontrado' },
        { status: 404 }
      )
    }

    if (existe.estado !== 'PROGRAMADO') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar mantenimientos programados' },
        { status: 400 }
      )
    }

    await db.mantenimientoPreventivo.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar mantenimiento' },
      { status: 500 }
    )
  }
}
