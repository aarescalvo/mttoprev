// Tipos para el sistema MTOPREV

export type EstadoSolicitud =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'ESPERANDO_INSUMOS'
  | 'INSUMOS_RECIBIDOS'
  | 'EN_EJECUCION'
  | 'CERRADA'

export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA'

export type PrioridadSolicitud = 'ALTA' | 'MEDIA' | 'BAJA'

export type EstadoHerramienta = 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO' | 'BAJA'

export type TipoHerramienta = 'MANUAL' | 'ELECTRICA' | 'MEDICION' | 'ESPECIAL'

export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_SERVICIO'

export type EstadoMantenimiento = 'PROGRAMADO' | 'EN_EJECUCION' | 'COMPLETADO' | 'CANCELADO'

export type TipoMovimientoStock = 'ENTRADA' | 'SALIDA' | 'AJUSTE'

export type EstadoInsumo = 'PENDIENTE' | 'SOLICITADO' | 'RECIBIDO' | 'CANCELADO'

// Interfaces para formularios
export interface MaterialFormData {
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
}

export interface HerramientaFormData {
  codigo: string
  nombre: string
  tipo: TipoHerramienta
  estado: EstadoHerramienta
  ubicacion?: string
  fechaAdquisicion?: string
  fechaCalibracion?: string
  proximaCalibracion?: string
  observaciones?: string
}

export interface PersonalFormData {
  legajo: string
  nombre: string
  apellido: string
  especialidad?: string
  turno?: string
  telefono?: string
  email?: string
  areaId?: string
  fechaIngreso?: string
}

export interface SolicitudFormData {
  solicitante: string
  areaId?: string
  equipoId?: string
  tipoMantenimiento: TipoMantenimiento
  descripcionProblema: string
  prioridad: PrioridadSolicitud
  centroCostoId?: string
}

export interface EquipoFormData {
  codigo: string
  nombre: string
  marca?: string
  modelo?: string
  numeroSerie?: string
  areaId?: string
  ubicacion?: string
  fechaInstalacion?: string
  centroCostoId?: string
  frecuenciaMantenimiento?: number
  estado: EstadoEquipo
}

export interface CentroCostoFormData {
  codigo: string
  nombre: string
  descripcion?: string
  presupuesto?: number
}

export interface AreaFormData {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface CategoriaFormData {
  nombre: string
  descripcion?: string
}

// Interfaces para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardStats {
  solicitudesPendientes: number
  otsEnEjecucion: number
  stockBajo: number
  mantenimientosProximos: number
}

export interface ChartData {
  name: string
  value: number
  color?: string
}
