import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { herramientaId } = body

    // Buscar el último préstamo activo
    const prestamo = await db.prestamoHerramienta.findFirst({
      where: { herramientaId, devuelto: false },
      orderBy: { fechaPrestamo: 'desc' },
    })

    if (!prestamo) {
      return NextResponse.json({ success: false, error: 'No hay préstamo activo' })
    }

    // Registrar devolución
    await db.prestamoHerramienta.update({
      where: { id: prestamo.id },
      data: {
        fechaDevolucion: new Date(),
        devuelto: true,
      },
    })

    // Actualizar herramienta
    await db.herramienta.update({
      where: { id: herramientaId },
      data: { estado: 'DISPONIBLE', responsableId: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al procesar devolución' })
  }
}
