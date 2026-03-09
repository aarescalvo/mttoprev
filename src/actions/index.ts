'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ==================== MATERIALES ====================

export async function getMateriales() {
  try {
    const materiales = await db.material.findMany({
      include: {
        categoria: true,
        centroCosto: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: materiales }
  } catch (error) {
    return { success: false, error: 'Error al obtener materiales' }
  }
}

export async function createMaterial(data: {
  codigo: string
  nombre: string
  descripcion?: string
  categoriaId?: string
  stockActual: number
  stockMinimo: number
  unidad: string
  precio?: number
  ubicacion?: string
  centroCostoId?: string
}) {
  try {
    const material = await db.material.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId,
        stockActual: data.stockActual,
        stockMinimo: data.stockMinimo,
        unidad: data.unidad,
        precio: data.precio,
        ubicacion: data.ubicacion,
        centroCostoId: data.centroCostoId,
      },
    })
    revalidatePath('/stock')
    return { success: true, data: material }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El código de material ya existe' }
    }
    return { success: false, error: 'Error al crear material' }
  }
}

export async function updateMaterial(id: string, data: Partial<{
  codigo: string
  nombre: string
  descripcion: string
  categoriaId: string
  stockActual: number
  stockMinimo: number
  unidad: string
  precio: number
  ubicacion: string
  centroCostoId: string
  activo: boolean
}>) {
  try {
    const material = await db.material.update({
      where: { id },
      data,
    })
    revalidatePath('/stock')
    return { success: true, data: material }
  } catch (error) {
    return { success: false, error: 'Error al actualizar material' }
  }
}

export async function deleteMaterial(id: string) {
  try {
    await db.material.delete({ where: { id } })
    revalidatePath('/stock')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar material' }
  }
}

export async function getMovimientosStock(materialId?: string) {
  try {
    const movimientos = await db.movimientoStock.findMany({
      where: materialId ? { materialId } : undefined,
      include: {
        material: true,
        centroCosto: true,
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    })
    return { success: true, data: movimientos }
  } catch (error) {
    return { success: false, error: 'Error al obtener movimientos' }
  }
}

export async function createMovimientoStock(data: {
  materialId: string
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number
  motivo?: string
  referencia?: string
  centroCostoId?: string
  usuario?: string
}) {
  try {
    const material = await db.material.findUnique({
      where: { id: data.materialId },
    })
    if (!material) {
      return { success: false, error: 'Material no encontrado' }
    }

    let stockNuevo = material.stockActual
    if (data.tipo === 'ENTRADA') {
      stockNuevo += data.cantidad
    } else if (data.tipo === 'SALIDA') {
      stockNuevo -= data.cantidad
    } else {
      stockNuevo = data.cantidad
    }

    const movimiento = await db.movimientoStock.create({
      data: {
        materialId: data.materialId,
        tipo: data.tipo,
        cantidad: data.cantidad,
        motivo: data.motivo,
        referencia: data.referencia,
        stockAnterior: material.stockActual,
        stockNuevo,
        centroCostoId: data.centroCostoId,
        usuario: data.usuario,
      },
    })

    await db.material.update({
      where: { id: data.materialId },
      data: { stockActual: stockNuevo },
    })

    revalidatePath('/stock')
    return { success: true, data: movimiento }
  } catch (error) {
    return { success: false, error: 'Error al crear movimiento' }
  }
}

// ==================== CATEGORÍAS ====================

export async function getCategorias() {
  try {
    const categorias = await db.categoriaMaterial.findMany({
      orderBy: { nombre: 'asc' },
    })
    return { success: true, data: categorias }
  } catch (error) {
    return { success: false, error: 'Error al obtener categorías' }
  }
}

export async function createCategoria(nombre: string, descripcion?: string) {
  try {
    const categoria = await db.categoriaMaterial.create({
      data: { nombre, descripcion },
    })
    return { success: true, data: categoria }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'La categoría ya existe' }
    }
    return { success: false, error: 'Error al crear categoría' }
  }
}

// ==================== HERRAMIENTAS ====================

export async function getHerramientas() {
  try {
    const herramientas = await db.herramienta.findMany({
      include: {
        responsable: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: herramientas }
  } catch (error) {
    return { success: false, error: 'Error al obtener herramientas' }
  }
}

export async function createHerramienta(data: {
  codigo: string
  nombre: string
  tipo: string
  estado?: string
  ubicacion?: string
  fechaAdquisicion?: Date
  fechaCalibracion?: Date
  proximaCalibracion?: Date
  observaciones?: string
}) {
  try {
    const herramienta = await db.herramienta.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipo: data.tipo,
        estado: data.estado || 'DISPONIBLE',
        ubicacion: data.ubicacion,
        fechaAdquisicion: data.fechaAdquisicion,
        fechaCalibracion: data.fechaCalibracion,
        proximaCalibracion: data.proximaCalibracion,
        observaciones: data.observaciones,
      },
    })
    revalidatePath('/herramientas')
    return { success: true, data: herramienta }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El código de herramienta ya existe' }
    }
    return { success: false, error: 'Error al crear herramienta' }
  }
}

export async function updateHerramienta(id: string, data: Partial<{
  codigo: string
  nombre: string
  tipo: string
  estado: string
  ubicacion: string
  fechaAdquisicion: Date
  fechaCalibracion: Date
  proximaCalibracion: Date
  responsableId: string
  observaciones: string
  activo: boolean
}>) {
  try {
    const herramienta = await db.herramienta.update({
      where: { id },
      data,
    })
    revalidatePath('/herramientas')
    return { success: true, data: herramienta }
  } catch (error) {
    return { success: false, error: 'Error al actualizar herramienta' }
  }
}

export async function deleteHerramienta(id: string) {
  try {
    await db.herramienta.delete({ where: { id } })
    revalidatePath('/herramientas')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar herramienta' }
  }
}

export async function prestarHerramienta(herramientaId: string, personalId: string, observaciones?: string) {
  try {
    const prestamo = await db.prestamoHerramienta.create({
      data: {
        herramientaId,
        personalId,
        observaciones,
      },
    })

    await db.herramienta.update({
      where: { id: herramientaId },
      data: { estado: 'EN_USO', responsableId: personalId },
    })

    revalidatePath('/herramientas')
    return { success: true, data: prestamo }
  } catch (error) {
    return { success: false, error: 'Error al prestar herramienta' }
  }
}

export async function devolverHerramienta(prestamoId: string, recibidoPor?: string) {
  try {
    const prestamo = await db.prestamoHerramienta.update({
      where: { id: prestamoId },
      data: {
        fechaDevolucion: new Date(),
        devuelto: true,
        recibidoPor,
      },
      include: { herramienta: true },
    })

    await db.herramienta.update({
      where: { id: prestamo.herramientaId },
      data: { estado: 'DISPONIBLE', responsableId: null },
    })

    revalidatePath('/herramientas')
    return { success: true, data: prestamo }
  } catch (error) {
    return { success: false, error: 'Error al devolver herramienta' }
  }
}

// ==================== PERSONAL ====================

export async function getPersonal() {
  try {
    const personal = await db.personal.findMany({
      include: {
        area: true,
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    })
    return { success: true, data: personal }
  } catch (error) {
    return { success: false, error: 'Error al obtener personal' }
  }
}

export async function createPersonal(data: {
  legajo: string
  nombre: string
  apellido: string
  especialidad?: string
  turno?: string
  telefono?: string
  email?: string
  areaId?: string
  fechaIngreso?: Date
}) {
  try {
    const personal = await db.personal.create({
      data: {
        legajo: data.legajo,
        nombre: data.nombre,
        apellido: data.apellido,
        especialidad: data.especialidad,
        turno: data.turno,
        telefono: data.telefono,
        email: data.email,
        areaId: data.areaId,
        fechaIngreso: data.fechaIngreso,
      },
    })
    revalidatePath('/personal')
    return { success: true, data: personal }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El legajo ya existe' }
    }
    return { success: false, error: 'Error al crear personal' }
  }
}

export async function updatePersonal(id: string, data: Partial<{
  legajo: string
  nombre: string
  apellido: string
  especialidad: string
  turno: string
  telefono: string
  email: string
  areaId: string
  fechaIngreso: Date
  activo: boolean
}>) {
  try {
    const personal = await db.personal.update({
      where: { id },
      data,
    })
    revalidatePath('/personal')
    return { success: true, data: personal }
  } catch (error) {
    return { success: false, error: 'Error al actualizar personal' }
  }
}

export async function deletePersonal(id: string) {
  try {
    await db.personal.delete({ where: { id } })
    revalidatePath('/personal')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar personal' }
  }
}

// ==================== ÁREAS ====================

export async function getAreas() {
  try {
    const areas = await db.area.findMany({
      orderBy: { nombre: 'asc' },
    })
    return { success: true, data: areas }
  } catch (error) {
    return { success: false, error: 'Error al obtener áreas' }
  }
}

export async function createArea(codigo: string, nombre: string, descripcion?: string) {
  try {
    const area = await db.area.create({
      data: { codigo, nombre, descripcion },
    })
    return { success: true, data: area }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El código de área ya existe' }
    }
    return { success: false, error: 'Error al crear área' }
  }
}

// ==================== CENTROS DE COSTO ====================

export async function getCentrosCosto() {
  try {
    const centros = await db.centroCosto.findMany({
      orderBy: { codigo: 'asc' },
    })
    return { success: true, data: centros }
  } catch (error) {
    return { success: false, error: 'Error al obtener centros de costo' }
  }
}

export async function createCentroCosto(data: {
  codigo: string
  nombre: string
  descripcion?: string
  presupuesto?: number
}) {
  try {
    const centro = await db.centroCosto.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        presupuesto: data.presupuesto,
      },
    })
    revalidatePath('/centros-costo')
    return { success: true, data: centro }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El código ya existe' }
    }
    return { success: false, error: 'Error al crear centro de costo' }
  }
}

export async function updateCentroCosto(id: string, data: Partial<{
  codigo: string
  nombre: string
  descripcion: string
  presupuesto: number
  activo: boolean
}>) {
  try {
    const centro = await db.centroCosto.update({
      where: { id },
      data,
    })
    revalidatePath('/centros-costo')
    return { success: true, data: centro }
  } catch (error) {
    return { success: false, error: 'Error al actualizar centro de costo' }
  }
}

export async function deleteCentroCosto(id: string) {
  try {
    await db.centroCosto.delete({ where: { id } })
    revalidatePath('/centros-costo')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar centro de costo' }
  }
}

// ==================== EQUIPOS ====================

export async function getEquipos() {
  try {
    const equipos = await db.equipo.findMany({
      include: {
        area: true,
        centroCosto: true,
      },
      orderBy: { codigo: 'asc' },
    })
    return { success: true, data: equipos }
  } catch (error) {
    return { success: false, error: 'Error al obtener equipos' }
  }
}

export async function createEquipo(data: {
  codigo: string
  nombre: string
  marca?: string
  modelo?: string
  numeroSerie?: string
  areaId?: string
  ubicacion?: string
  fechaInstalacion?: Date
  centroCostoId?: string
  frecuenciaMantenimiento?: number
  estado?: string
}) {
  try {
    const equipo = await db.equipo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        marca: data.marca,
        modelo: data.modelo,
        numeroSerie: data.numeroSerie,
        areaId: data.areaId,
        ubicacion: data.ubicacion,
        fechaInstalacion: data.fechaInstalacion,
        centroCostoId: data.centroCostoId,
        frecuenciaMantenimiento: data.frecuenciaMantenimiento,
        estado: data.estado || 'OPERATIVO',
      },
    })
    revalidatePath('/mantenimientos')
    return { success: true, data: equipo }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'El código de equipo ya existe' }
    }
    return { success: false, error: 'Error al crear equipo' }
  }
}

export async function updateEquipo(id: string, data: Partial<{
  codigo: string
  nombre: string
  marca: string
  modelo: string
  numeroSerie: string
  areaId: string
  ubicacion: string
  fechaInstalacion: Date
  centroCostoId: string
  frecuenciaMantenimiento: number
  ultimoMantenimiento: Date
  proximoMantenimiento: Date
  estado: string
  activo: boolean
}>) {
  try {
    const equipo = await db.equipo.update({
      where: { id },
      data,
    })
    revalidatePath('/mantenimientos')
    return { success: true, data: equipo }
  } catch (error) {
    return { success: false, error: 'Error al actualizar equipo' }
  }
}

export async function deleteEquipo(id: string) {
  try {
    await db.equipo.delete({ where: { id } })
    revalidatePath('/mantenimientos')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar equipo' }
  }
}

// ==================== SOLICITUDES DE MANTENIMIENTO ====================

export async function getSolicitudes(filtros?: {
  estado?: string
  areaId?: string
  prioridad?: string
  fechaDesde?: Date
  fechaHasta?: Date
}) {
  try {
    const solicitudes = await db.solicitudMantenimiento.findMany({
      where: {
        estado: filtros?.estado,
        areaId: filtros?.areaId,
        prioridad: filtros?.prioridad,
        fechaSolicitud: {
          gte: filtros?.fechaDesde,
          lte: filtros?.fechaHasta,
        },
      },
      include: {
        area: true,
        equipo: true,
        centroCosto: true,
        asignadoA: true,
        insumosSolicitados: {
          include: {
            material: true,
          },
        },
        historialEstados: {
          orderBy: { fechaCambio: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: solicitudes }
  } catch (error) {
    return { success: false, error: 'Error al obtener solicitudes' }
  }
}

export async function getSolicitudById(id: string) {
  try {
    const solicitud = await db.solicitudMantenimiento.findUnique({
      where: { id },
      include: {
        area: true,
        equipo: true,
        centroCosto: true,
        asignadoA: true,
        insumosSolicitados: {
          include: {
            material: true,
          },
        },
        historialEstados: {
          orderBy: { fechaCambio: 'desc' },
        },
        checklistItems: {
          orderBy: { orden: 'asc' },
        },
      },
    })
    return { success: true, data: solicitud }
  } catch (error) {
    return { success: false, error: 'Error al obtener solicitud' }
  }
}

export async function createSolicitud(data: {
  solicitante: string
  solicitanteId?: string
  areaId?: string
  equipoId?: string
  tipoMantenimiento: string
  descripcionProblema: string
  prioridad?: string
  centroCostoId?: string
  observaciones?: string
}) {
  try {
    // Generar número de solicitud
    const ultimaSolicitud = await db.solicitudMantenimiento.findFirst({
      orderBy: { numero: 'desc' },
    })
    const numero = ultimaSolicitud
      ? `SOL-${String(parseInt(ultimaSolicitud.numero.split('-')[1]) + 1).padStart(6, '0')}`
      : 'SOL-000001'

    const solicitud = await db.solicitudMantenimiento.create({
      data: {
        numero,
        solicitante: data.solicitante,
        solicitanteId: data.solicitanteId,
        areaId: data.areaId,
        equipoId: data.equipoId,
        tipoMantenimiento: data.tipoMantenimiento,
        descripcionProblema: data.descripcionProblema,
        prioridad: data.prioridad || 'MEDIA',
        centroCostoId: data.centroCostoId,
        observaciones: data.observaciones,
      },
    })

    // Crear historial de estado inicial
    await db.historialEstadoSolicitud.create({
      data: {
        solicitudId: solicitud.id,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        usuario: data.solicitante,
        comentario: 'Solicitud creada',
      },
    })

    revalidatePath('/solicitudes')
    return { success: true, data: solicitud }
  } catch (error) {
    return { success: false, error: 'Error al crear solicitud' }
  }
}

export async function cambiarEstadoSolicitud(
  id: string,
  nuevoEstado: string,
  usuario: string,
  comentario?: string,
  datosAdicionales?: {
    aprobadoPor?: string
    asignadoAId?: string
    cerradoPor?: string
    observacionesCierre?: string
    trabajoRealizado?: string
    costoMateriales?: number
    costoManoObra?: number
  }
) {
  try {
    const solicitudActual = await db.solicitudMantenimiento.findUnique({
      where: { id },
    })
    if (!solicitudActual) {
      return { success: false, error: 'Solicitud no encontrada' }
    }

    const updateData: any = { estado: nuevoEstado }

    // Agregar campos según el estado
    if (nuevoEstado === 'APROBADA') {
      updateData.fechaAprobacion = new Date()
      updateData.aprobadoPor = datosAdicionales?.aprobadoPor || usuario
    }
    if (nuevoEstado === 'EN_EJECUCION') {
      updateData.fechaInicioTrabajo = new Date()
      if (datosAdicionales?.asignadoAId) {
        updateData.asignadoAId = datosAdicionales.asignadoAId
      }
    }
    if (nuevoEstado === 'CERRADA') {
      updateData.fechaCierre = new Date()
      updateData.fechaFinTrabajo = new Date()
      updateData.cerradoPor = datosAdicionales?.cerradoPor || usuario
      if (datosAdicionales?.observacionesCierre) {
        updateData.observacionesCierre = datosAdicionales.observacionesCierre
      }
      if (datosAdicionales?.trabajoRealizado) {
        updateData.trabajoRealizado = datosAdicionales.trabajoRealizado
      }
      if (datosAdicionales?.costoMateriales) {
        updateData.costoMateriales = datosAdicionales.costoMateriales
      }
      if (datosAdicionales?.costoManoObra) {
        updateData.costoManoObra = datosAdicionales.costoManoObra
      }
      if (datosAdicionales?.costoMateriales || datosAdicionales?.costoManoObra) {
        updateData.costoTotal = (datosAdicionales?.costoMateriales || 0) + (datosAdicionales?.costoManoObra || 0)
      }
      // Calcular tiempos
      if (solicitudActual.fechaSolicitud) {
        const tiempoRespuesta = (new Date().getTime() - new Date(solicitudActual.fechaSolicitud).getTime()) / (1000 * 60 * 60)
        updateData.tiempoRespuesta = tiempoRespuesta
      }
    }

    const solicitud = await db.solicitudMantenimiento.update({
      where: { id },
      data: updateData,
    })

    // Crear historial
    await db.historialEstadoSolicitud.create({
      data: {
        solicitudId: id,
        estadoAnterior: solicitudActual.estado,
        estadoNuevo: nuevoEstado,
        usuario,
        comentario,
      },
    })

    revalidatePath('/solicitudes')
    return { success: true, data: solicitud }
  } catch (error) {
    return { success: false, error: 'Error al cambiar estado' }
  }
}

export async function agregarInsumoSolicitud(data: {
  solicitudId: string
  materialId: string
  cantidadSolicitada: number
  precioUnitario?: number
  observaciones?: string
}) {
  try {
    const insumo = await db.insumoSolicitado.create({
      data: {
        solicitudId: data.solicitudId,
        materialId: data.materialId,
        cantidadSolicitada: data.cantidadSolicitada,
        precioUnitario: data.precioUnitario,
        observaciones: data.observaciones,
      },
    })

    // Si la solicitud está aprobada, cambiar a esperando insumos
    const solicitud = await db.solicitudMantenimiento.findUnique({
      where: { id: data.solicitudId },
    })
    if (solicitud && solicitud.estado === 'APROBADA') {
      await db.solicitudMantenimiento.update({
        where: { id: data.solicitudId },
        data: { estado: 'ESPERANDO_INSUMOS' },
      })
      await db.historialEstadoSolicitud.create({
        data: {
          solicitudId: data.solicitudId,
          estadoAnterior: 'APROBADA',
          estadoNuevo: 'ESPERANDO_INSUMOS',
          comentario: 'Insumos solicitados',
        },
      })
    }

    revalidatePath('/solicitudes')
    return { success: true, data: insumo }
  } catch (error) {
    return { success: false, error: 'Error al agregar insumo' }
  }
}

export async function registrarLlegadaInsumo(
  insumoId: string,
  cantidadRecibida: number,
  recibidoPor: string,
  observaciones?: string
) {
  try {
    const insumo = await db.insumoSolicitado.update({
      where: { id: insumoId },
      data: {
        cantidadRecibida,
        estado: cantidadRecibida >= (await db.insumoSolicitado.findUnique({ where: { id: insumoId } }))!.cantidadSolicitada ? 'RECIBIDO' : 'PARCIAL',
        fechaLlegada: new Date(),
        recibidoPor,
        observaciones,
      },
      include: { solicitud: true },
    })

    // Verificar si todos los insumos llegaron
    const todosInsumos = await db.insumoSolicitado.findMany({
      where: { solicitudId: insumo.solicitudId },
    })
    const todosRecibidos = todosInsumos.every(i => i.estado === 'RECIBIDO')

    if (todosRecibidos && insumo.solicitud.estado === 'ESPERANDO_INSUMOS') {
      await db.solicitudMantenimiento.update({
        where: { id: insumo.solicitudId },
        data: { estado: 'INSUMOS_RECIBIDOS' },
      })
      await db.historialEstadoSolicitud.create({
        data: {
          solicitudId: insumo.solicitudId,
          estadoAnterior: 'ESPERANDO_INSUMOS',
          estadoNuevo: 'INSUMOS_RECIBIDOS',
          comentario: 'Todos los insumos recibidos',
          usuario: recibidoPor,
        },
      })
    }

    revalidatePath('/solicitudes')
    return { success: true, data: insumo }
  } catch (error) {
    return { success: false, error: 'Error al registrar llegada' }
  }
}

export async function deleteSolicitud(id: string) {
  try {
    // Eliminar primero los registros relacionados
    await db.insumoSolicitado.deleteMany({ where: { solicitudId: id } })
    await db.historialEstadoSolicitud.deleteMany({ where: { solicitudId: id } })
    await db.checklistItem.deleteMany({ where: { solicitudId: id } })
    
    await db.solicitudMantenimiento.delete({ where: { id } })
    revalidatePath('/solicitudes')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al eliminar solicitud' }
  }
}

// ==================== MANTENIMIENTO PREVENTIVO ====================

export async function getMantenimientosPreventivos() {
  try {
    const mantenimientos = await db.mantenimientoPreventivo.findMany({
      include: {
        equipo: {
          include: {
            area: true,
          },
        },
        centroCosto: true,
        checklist: {
          include: {
            tarea: true,
          },
        },
      },
      orderBy: { fechaProgramada: 'asc' },
    })
    return { success: true, data: mantenimientos }
  } catch (error) {
    return { success: false, error: 'Error al obtener mantenimientos' }
  }
}

export async function createMantenimientoPreventivo(data: {
  equipoId: string
  fechaProgramada: Date
  centroCostoId?: string
}) {
  try {
    // Generar número de OT
    const ultimaOT = await db.mantenimientoPreventivo.findFirst({
      orderBy: { numeroOT: 'desc' },
    })
    const numeroOT = ultimaOT
      ? `OT-${String(parseInt(ultimaOT.numeroOT.split('-')[1]) + 1).padStart(6, '0')}`
      : 'OT-000001'

    const mantenimiento = await db.mantenimientoPreventivo.create({
      data: {
        numeroOT,
        equipoId: data.equipoId,
        fechaProgramada: data.fechaProgramada,
        centroCostoId: data.centroCostoId,
      },
    })

    // Crear checklist para el equipo
    const tareas = await db.tareaMantenimiento.findMany({
      where: { equipoId: data.equipoId, activo: true },
    })
    for (const tarea of tareas) {
      await db.checklistMantenimiento.create({
        data: {
          mantenimientoId: mantenimiento.id,
          tareaId: tarea.id,
        },
      })
    }

    revalidatePath('/mantenimientos')
    return { success: true, data: mantenimiento }
  } catch (error) {
    return { success: false, error: 'Error al crear mantenimiento' }
  }
}

export async function completarMantenimiento(
  id: string,
  data: {
    trabajoRealizado: string
    ejecutadoPor: string
    observaciones?: string
    horasTrabajo?: number
    costoMateriales?: number
    costoManoObra?: number
  }
) {
  try {
    const mantenimiento = await db.mantenimientoPreventivo.update({
      where: { id },
      data: {
        estado: 'COMPLETADO',
        fechaEjecucion: new Date(),
        trabajoRealizado: data.trabajoRealizado,
        ejecutadoPor: data.ejecutadoPor,
        observaciones: data.observaciones,
        horasTrabajo: data.horasTrabajo,
        costoMateriales: data.costoMateriales,
        costoManoObra: data.costoManoObra,
      },
      include: { equipo: true },
    })

    // Actualizar fechas del equipo
    await db.equipo.update({
      where: { id: mantenimiento.equipoId },
      data: {
        ultimoMantenimiento: new Date(),
        proximoMantenimiento: mantenimiento.equipo.frecuenciaMantenimiento
          ? new Date(Date.now() + mantenimiento.equipo.frecuenciaMantenimiento * 24 * 60 * 60 * 1000)
          : undefined,
      },
    })

    revalidatePath('/mantenimientos')
    return { success: true, data: mantenimiento }
  } catch (error) {
    return { success: false, error: 'Error al completar mantenimiento' }
  }
}

export async function getTareasMantenimiento(equipoId: string) {
  try {
    const tareas = await db.tareaMantenimiento.findMany({
      where: { equipoId, activo: true },
      orderBy: { createdAt: 'asc' },
    })
    return { success: true, data: tareas }
  } catch (error) {
    return { success: false, error: 'Error al obtener tareas' }
  }
}

export async function createTareaMantenimiento(data: {
  equipoId: string
  descripcion: string
  frecuencia: number
  tiempoEstimado?: number
  instrucciones?: string
}) {
  try {
    const tarea = await db.tareaMantenimiento.create({
      data: {
        equipoId: data.equipoId,
        descripcion: data.descripcion,
        frecuencia: data.frecuencia,
        tiempoEstimado: data.tiempoEstimado,
        instrucciones: data.instrucciones,
      },
    })
    revalidatePath('/mantenimientos')
    return { success: true, data: tarea }
  } catch (error) {
    return { success: false, error: 'Error al crear tarea' }
  }
}

// ==================== DASHBOARD / ESTADÍSTICAS ====================

export async function getEstadisticasDashboard() {
  try {
    // Solicitudes por estado
    const solicitudesPorEstado = await db.solicitudMantenimiento.groupBy({
      by: ['estado'],
      _count: { id: true },
    })

    // Materiales con stock bajo
    const materialesStockBajo = await db.material.findMany({
      where: {
        activo: true,
        stockActual: { lte: db.material.fields.stockMinimo },
      },
      take: 10,
    })

    // Mantenimientos próximos (próximos 7 días)
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + 7)
    const mantenimientosProximos = await db.mantenimientoPreventivo.findMany({
      where: {
        estado: 'PROGRAMADO',
        fechaProgramada: {
          gte: new Date(),
          lte: fechaLimite,
        },
      },
      include: { equipo: true },
      take: 10,
    })

    // Mantenimientos vencidos
    const mantenimientosVencidos = await db.mantenimientoPreventivo.findMany({
      where: {
        estado: 'PROGRAMADO',
        fechaProgramada: { lt: new Date() },
      },
      include: { equipo: true },
      take: 10,
    })

    // Conteos generales
    const totalSolicitudesPendientes = await db.solicitudMantenimiento.count({
      where: { estado: { in: ['PENDIENTE', 'APROBADA', 'ESPERANDO_INSUMOS', 'INSUMOS_RECIBIDOS', 'EN_EJECUCION'] } },
    })

    const totalMaterialesStockBajo = await db.material.count({
      where: {
        activo: true,
        stockActual: { lte: db.material.fields.stockMinimo },
      },
    })

    const totalMantenimientosVencidos = await db.mantenimientoPreventivo.count({
      where: {
        estado: 'PROGRAMADO',
        fechaProgramada: { lt: new Date() },
      },
    })

    // Costos por centro de costo (último mes)
    const haceUnMes = new Date()
    haceUnMes.setMonth(haceUnMes.getMonth() - 1)
    const costosPorCentro = await db.solicitudMantenimiento.groupBy({
      by: ['centroCostoId'],
      where: {
        fechaCierre: { gte: haceUnMes },
        centroCostoId: { not: null },
      },
      _sum: { costoTotal: true },
    })

    // Últimas solicitudes
    const ultimasSolicitudes = await db.solicitudMantenimiento.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { area: true, equipo: true },
    })

    return {
      success: true,
      data: {
        solicitudesPorEstado,
        materialesStockBajo,
        mantenimientosProximos,
        mantenimientosVencidos,
        totalSolicitudesPendientes,
        totalMaterialesStockBajo,
        totalMantenimientosVencidos,
        costosPorCentro,
        ultimasSolicitudes,
      },
    }
  } catch (error) {
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}

// ==================== REPORTES ====================

export async function getReporteSolicitudes(filtros: {
  fechaDesde?: Date
  fechaHasta?: Date
  estado?: string
  areaId?: string
  centroCostoId?: string
}) {
  try {
    const solicitudes = await db.solicitudMantenimiento.findMany({
      where: {
        fechaSolicitud: {
          gte: filtros.fechaDesde,
          lte: filtros.fechaHasta,
        },
        estado: filtros.estado,
        areaId: filtros.areaId,
        centroCostoId: filtros.centroCostoId,
      },
      include: {
        area: true,
        equipo: true,
        centroCosto: true,
        asignadoA: true,
        insumosSolicitados: { include: { material: true } },
      },
      orderBy: { fechaSolicitud: 'desc' },
    })
    return { success: true, data: solicitudes }
  } catch (error) {
    return { success: false, error: 'Error al generar reporte' }
  }
}

export async function getReporteCostos(centroCostoId?: string, fechaDesde?: Date, fechaHasta?: Date) {
  try {
    const solicitudes = await db.solicitudMantenimiento.findMany({
      where: {
        centroCostoId,
        fechaCierre: {
          gte: fechaDesde,
          lte: fechaHasta,
        },
      },
      include: {
        centroCosto: true,
        insumosSolicitados: { include: { material: true } },
      },
    })

    const movimientos = await db.movimientoStock.findMany({
      where: {
        centroCostoId,
        fecha: {
          gte: fechaDesde,
          lte: fechaHasta,
        },
      },
      include: {
        material: true,
        centroCosto: true,
      },
    })

    return { success: true, data: { solicitudes, movimientos } }
  } catch (error) {
    return { success: false, error: 'Error al generar reporte de costos' }
  }
}
