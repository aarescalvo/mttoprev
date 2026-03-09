import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function getEstadoColor(estado: string): string {
  const colors: Record<string, string> = {
    // Estados de solicitud
    'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'APROBADA': 'bg-blue-100 text-blue-800 border-blue-200',
    'RECHAZADA': 'bg-red-100 text-red-800 border-red-200',
    'ESPERANDO_INSUMOS': 'bg-orange-100 text-orange-800 border-orange-200',
    'INSUMOS_RECIBIDOS': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'EN_EJECUCION': 'bg-purple-100 text-purple-800 border-purple-200',
    'CERRADA': 'bg-green-100 text-green-800 border-green-200',
    // Estados de mantenimiento
    'PROGRAMADO': 'bg-blue-100 text-blue-800 border-blue-200',
    'EN_EJECUCION': 'bg-purple-100 text-purple-800 border-purple-200',
    'COMPLETADO': 'bg-green-100 text-green-800 border-green-200',
    'CANCELADO': 'bg-red-100 text-red-800 border-red-200',
    // Estados de herramienta
    'DISPONIBLE': 'bg-green-100 text-green-800 border-green-200',
    'EN_USO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'MANTENIMIENTO': 'bg-orange-100 text-orange-800 border-orange-200',
    'BAJA': 'bg-gray-100 text-gray-800 border-gray-200',
    // Estados de equipo
    'OPERATIVO': 'bg-green-100 text-green-800 border-green-200',
    'EN_MANTENIMIENTO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'FUERA_SERVICIO': 'bg-red-100 text-red-800 border-red-200',
    // Prioridad
    'ALTA': 'bg-red-100 text-red-800 border-red-200',
    'MEDIA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'BAJA': 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getPrioridadIcon(prioridad: string): string {
  switch (prioridad) {
    case 'ALTA': return '🔴'
    case 'MEDIA': return '🟡'
    case 'BAJA': return '🟢'
    default: return '⚪'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function calcularTiempoRespuesta(fechaInicio: Date, fechaFin: Date): number {
  const diffMs = fechaFin.getTime() - fechaInicio.getTime()
  return Math.round(diffMs / (1000 * 60 * 60)) // horas
}

export function isStockBajo(stockActual: number, stockMinimo: number): boolean {
  return stockActual <= stockMinimo
}

export function getEstadoSolicitudLabel(estado: string): string {
  const labels: Record<string, string> = {
    'PENDIENTE': 'Pendiente',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada',
    'ESPERANDO_INSUMOS': 'Esperando Insumos',
    'INSUMOS_RECIBIDOS': 'Insumos Recibidos',
    'EN_EJECUCION': 'En Ejecución',
    'CERRADA': 'Cerrada'
  }
  return labels[estado] || estado
}

export function getTipoMantenimientoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'PREVENTIVO': 'Preventivo',
    'CORRECTIVO': 'Correctivo',
    'EMERGENCIA': 'Emergencia'
  }
  return labels[tipo] || tipo
}
