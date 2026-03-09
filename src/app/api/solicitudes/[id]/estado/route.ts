import { NextRequest, NextResponse } from 'next/server'
import { cambiarEstadoSolicitud } from '@/actions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const result = await cambiarEstadoSolicitud(
    id,
    body.nuevoEstado,
    body.usuario || 'Sistema',
    body.comentario,
    {
      aprobadoPor: body.aprobadoPor,
      asignadoAId: body.asignadoAId,
      cerradoPor: body.cerradoPor,
      observacionesCierre: body.observacionesCierre,
      trabajoRealizado: body.trabajoRealizado,
      costoMateriales: body.costoMateriales,
      costoManoObra: body.costoManoObra,
    }
  )
  return NextResponse.json(result)
}
