import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Generar reportes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo') || 'general'
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')
    const centroCostoId = searchParams.get('centroCostoId')
    const areaId = searchParams.get('areaId')

    const fechaDesde = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const fechaHasta = hasta ? new Date(hasta) : new Date()

    let reporte: any = {}

    switch (tipo) {
      case 'solicitudes':
        reporte = await generarReporteSolicitudes(fechaDesde, fechaHasta, centroCostoId, areaId)
        break
      case 'materiales':
        reporte = await generarReporteMateriales(fechaDesde, fechaHasta, centroCostoId)
        break
      case 'costos':
        reporte = await generarReporteCostos(fechaDesde, fechaHasta, centroCostoId)
        break
      case 'tiempos':
        reporte = await generarReporteTiempos(fechaDesde, fechaHasta)
        break
      default:
        reporte = await generarReporteGeneral(fechaDesde, fechaHasta)
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error al generar reporte:', error)
    return NextResponse.json(
      { error: 'Error al generar reporte' },
      { status: 500 }
    )
  }
}

async function generarReporteSolicitudes(
  desde: Date,
  hasta: Date,
  centroCostoId?: string | null,
  areaId?: string | null
) {
  const where: any = {
    createdAt: { gte: desde, lte: hasta }
  }
  if (centroCostoId) where.centroCostoId = centroCostoId
  if (areaId) where.areaId = areaId

  const solicitudes = await db.solicitudMantenimiento.findMany({
    where,
    include: {
      equipo: true,
      area: true,
      centroCosto: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const porEstado = solicitudes.reduce((acc: any, s) => {
    acc[s.estado] = (acc[s.estado] || 0) + 1
    return acc
  }, {})

  const porTipo = solicitudes.reduce((acc: any, s) => {
    acc[s.tipoMantenimiento] = (acc[s.tipoMantenimiento] || 0) + 1
    return acc
  }, {})

  const porPrioridad = solicitudes.reduce((acc: any, s) => {
    acc[s.prioridad] = (acc[s.prioridad] || 0) + 1
    return acc
  }, {})

  return {
    titulo: 'Reporte de Solicitudes de Mantenimiento',
    periodo: { desde, hasta },
    resumen: {
      total: solicitudes.length,
      porEstado,
      porTipo,
      porPrioridad
    },
    detalles: solicitudes
  }
}

async function generarReporteMateriales(
  desde: Date,
  hasta: Date,
  centroCostoId?: string | null
) {
  const where: any = {
    fecha: { gte: desde, lte: hasta }
  }
  if (centroCostoId) where.centroCostoId = centroCostoId

  const movimientos = await db.movimientoStock.findMany({
    where,
    include: {
      material: true,
      centroCosto: true
    },
    orderBy: { fecha: 'desc' }
  })

  const entradas = movimientos.filter(m => m.tipo === 'ENTRADA')
  const salidas = movimientos.filter(m => m.tipo === 'SALIDA')
  const ajustes = movimientos.filter(m => m.tipo === 'AJUSTE')

  const totalEntradas = entradas.reduce((acc, m) => acc + m.cantidad, 0)
  const totalSalidas = salidas.reduce((acc, m) => acc + m.cantidad, 0)

  const materialesStockBajo = await db.material.findMany({
    where: { activo: true }
  }).then(materiales => materiales.filter(m => m.stockActual <= m.stockMinimo))

  return {
    titulo: 'Reporte de Consumo de Materiales',
    periodo: { desde, hasta },
    resumen: {
      totalMovimientos: movimientos.length,
      entradas: entradas.length,
      salidas: salidas.length,
      ajustes: ajustes.length,
      cantidadTotalEntradas: totalEntradas,
      cantidadTotalSalidas: totalSalidas,
      materialesStockBajo: materialesStockBajo.length
    },
    detalles: movimientos,
    alertas: materialesStockBajo
  }
}

async function generarReporteCostos(
  desde: Date,
  hasta: Date,
  centroCostoId?: string | null
) {
  const where: any = {
    createdAt: { gte: desde, lte: hasta },
    costoTotal: { not: null }
  }
  if (centroCostoId) where.centroCostoId = centroCostoId

  const solicitudes = await db.solicitudMantenimiento.findMany({
    where,
    include: {
      centroCosto: true
    }
  })

  const costosPorCentro = solicitudes.reduce((acc: any, s) => {
    const centro = s.centroCosto?.nombre || 'Sin centro'
    acc[centro] = (acc[centro] || 0) + (s.costoTotal || 0)
    return acc
  }, {})

  const totalMateriales = solicitudes.reduce((acc, s) => acc + (s.costoMateriales || 0), 0)
  const totalManoObra = solicitudes.reduce((acc, s) => acc + (s.costoManoObra || 0), 0)
  const totalGeneral = solicitudes.reduce((acc, s) => acc + (s.costoTotal || 0), 0)

  return {
    titulo: 'Reporte de Costos',
    periodo: { desde, hasta },
    resumen: {
      totalSolicitudes: solicitudes.length,
      totalMateriales,
      totalManoObra,
      totalGeneral,
      costoPromedio: solicitudes.length > 0 ? totalGeneral / solicitudes.length : 0
    },
    costosPorCentro,
    detalles: solicitudes
  }
}

async function generarReporteTiempos(
  desde: Date,
  hasta: Date
) {
  const where: any = {
    createdAt: { gte: desde, lte: hasta },
    estado: 'CERRADA',
    fechaInicioTrabajo: { not: null },
    fechaCierre: { not: null }
  }

  const solicitudes = await db.solicitudMantenimiento.findMany({
    where,
    select: {
      numero: true,
      prioridad: true,
      tipoMantenimiento: true,
      createdAt: true,
      fechaAprobacion: true,
      fechaInicioTrabajo: true,
      fechaCierre: true,
      tiempoRespuesta: true,
      tiempoEjecucion: true
    }
  })

  const tiemposRespuesta = solicitudes
    .filter(s => s.tiempoRespuesta)
    .map(s => s.tiempoRespuesta as number)

  const tiemposEjecucion = solicitudes
    .filter(s => s.tiempoEjecucion)
    .map(s => s.tiempoEjecucion as number)

  const promedioRespuesta = tiemposRespuesta.length > 0
    ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length
    : 0

  const promedioEjecucion = tiemposEjecucion.length > 0
    ? tiemposEjecucion.reduce((a, b) => a + b, 0) / tiemposEjecucion.length
    : 0

  return {
    titulo: 'Reporte de Tiempos de Respuesta',
    periodo: { desde, hasta },
    resumen: {
      solicitudesCerradas: solicitudes.length,
      promedioTiempoRespuesta: promedioRespuesta,
      promedioTiempoEjecucion: promedioEjecucion
    },
    detalles: solicitudes
  }
}

async function generarReporteGeneral(
  desde: Date,
  hasta: Date
) {
  const [
    totalSolicitudes,
    solicitudesCerradas,
    totalMateriales,
    materialesStockBajo,
    totalEquipos,
    equiposMantenimiento,
    totalPersonal
  ] = await Promise.all([
    db.solicitudMantenimiento.count({
      where: { createdAt: { gte: desde, lte: hasta } }
    }),
    db.solicitudMantenimiento.count({
      where: { 
        createdAt: { gte: desde, lte: hasta },
        estado: 'CERRADA' 
      }
    }),
    db.material.count({ where: { activo: true } }),
    db.material.findMany({ where: { activo: true } })
      .then(m => m.filter(mat => mat.stockActual <= mat.stockMinimo).length),
    db.equipo.count({ where: { activo: true } }),
    db.equipo.count({ where: { activo: true, estado: 'EN_MANTENIMIENTO' } }),
    db.personal.count({ where: { activo: true } })
  ])

  return {
    titulo: 'Reporte General',
    periodo: { desde, hasta },
    resumen: {
      solicitudes: {
        total: totalSolicitudes,
        cerradas: solicitudesCerradas,
        pendientes: totalSolicitudes - solicitudesCerradas
      },
      materiales: {
        total: totalMateriales,
        stockBajo: materialesStockBajo
      },
      equipos: {
        total: totalEquipos,
        enMantenimiento: equiposMantenimiento
      },
      personal: totalPersonal
    }
  }
}
