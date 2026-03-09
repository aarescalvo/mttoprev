'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  Clock,
  Package,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'

interface Estadisticas {
  solicitudesPorEstado: { estado: string; _count: { id: number } }[]
  materialesStockBajo: any[]
  mantenimientosProximos: any[]
  mantenimientosVencidos: any[]
  totalSolicitudesPendientes: number
  totalMaterialesStockBajo: number
  totalMantenimientosVencidos: number
  costosPorCentro: { centroCostoId: string; _sum: { costoTotal: number } }[]
  ultimasSolicitudes: any[]
}

const estadoConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDIENTE: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  APROBADA: { label: 'Aprobada', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle2 },
  ESPERANDO_INSUMOS: { label: 'Esperando Insumos', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package },
  INSUMOS_RECIBIDOS: { label: 'Insumos Recibidos', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: Package },
  EN_EJECUCION: { label: 'En Ejecución', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Wrench },
  CERRADA: { label: 'Cerrada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
  RECHAZADA: { label: 'Rechazada', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
}

export default function Dashboard() {
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Error al cargar datos</p>
      </div>
    )
  }

  const totalSolicitudes = stats.solicitudesPorEstado.reduce((acc, curr) => acc + curr._count.id, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de mantenimiento
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSolicitudesPendientes}</div>
            <p className="text-xs text-muted-foreground">En proceso de atención</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterialesStockBajo}</div>
            <p className="text-xs text-muted-foreground">Materiales bajo mínimo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mantenimientos Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMantenimientosVencidos}</div>
            <p className="text-xs text-muted-foreground">Requieren atención urgente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas (Mes)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.solicitudesPorEstado.find(s => s.estado === 'CERRADA')?._count.id || 0}
            </div>
            <p className="text-xs text-muted-foreground">Solicitudes resueltas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y listas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estado de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estado de Solicitudes
            </CardTitle>
            <CardDescription>Distribución actual por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.solicitudesPorEstado.map((item) => {
                const config = estadoConfig[item.estado] || { label: item.estado, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock }
                const Icon = config.icon
                const percentage = totalSolicitudes > 0 ? (item._count.id / totalSolicitudes) * 100 : 0
                
                return (
                  <div key={item.estado} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${config.bgColor}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <span className="text-sm font-bold">{item._count.id}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
              {stats.solicitudesPorEstado.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No hay solicitudes registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas y Notificaciones
            </CardTitle>
            <CardDescription>Elementos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mantenimientosVencidos.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-700">Mantenimientos Vencidos</span>
                  </div>
                  <div className="space-y-1">
                    {stats.mantenimientosVencidos.slice(0, 3).map((m: any) => (
                      <div key={m.id} className="text-sm text-red-600">
                        • {m.equipo?.nombre || 'Equipo'} - OT: {m.numeroOT}
                      </div>
                    ))}
                    {stats.mantenimientosVencidos.length > 3 && (
                      <div className="text-sm text-red-600">
                        ...y {stats.mantenimientosVencidos.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stats.materialesStockBajo.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-700">Stock Bajo</span>
                  </div>
                  <div className="space-y-1">
                    {stats.materialesStockBajo.slice(0, 3).map((m: any) => (
                      <div key={m.id} className="text-sm text-yellow-700">
                        • {m.nombre}: {m.stockActual} {m.unidad} (mín: {m.stockMinimo})
                      </div>
                    ))}
                    {stats.materialesStockBajo.length > 3 && (
                      <div className="text-sm text-yellow-700">
                        ...y {stats.materialesStockBajo.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stats.mantenimientosProximos.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-700">Próximos Mantenimientos (7 días)</span>
                  </div>
                  <div className="space-y-1">
                    {stats.mantenimientosProximos.slice(0, 3).map((m: any) => (
                      <div key={m.id} className="text-sm text-blue-600">
                        • {m.equipo?.nombre || 'Equipo'} - {new Date(m.fechaProgramada).toLocaleDateString('es-AR')}
                      </div>
                    ))}
                    {stats.mantenimientosProximos.length > 3 && (
                      <div className="text-sm text-blue-600">
                        ...y {stats.mantenimientosProximos.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stats.mantenimientosVencidos.length === 0 &&
               stats.materialesStockBajo.length === 0 &&
               stats.mantenimientosProximos.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>¡Todo en orden!</p>
                  <p className="text-sm">No hay alertas pendientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas solicitudes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Últimas Solicitudes</CardTitle>
            <CardDescription>Las solicitudes más recientes del sistema</CardDescription>
          </div>
          <Link href="/solicitudes">
            <Button variant="outline" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.ultimasSolicitudes.map((s: any) => {
              const config = estadoConfig[s.estado] || { label: s.estado, color: 'text-gray-600', bgColor: 'bg-gray-100' }
              return (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{s.numero}</span>
                      <Badge variant="outline" className={config.bgColor}>
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className={
                        s.prioridad === 'ALTA' ? 'bg-red-100 text-red-700' :
                        s.prioridad === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {s.prioridad}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {s.descripcionProblema}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Solicitante: {s.solicitante}</span>
                      <span>•</span>
                      <span>{new Date(s.fechaSolicitud).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                  <Link href={`/solicitudes?id=${s.id}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                </div>
              )
            })}
            {stats.ultimasSolicitudes.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No hay solicitudes registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
