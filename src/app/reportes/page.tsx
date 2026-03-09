'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileBarChart, Download, Loader2, FileText, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Solicitud {
  id: string
  numero: string
  fechaSolicitud: Date
  solicitante: string
  tipoMantenimiento: string
  descripcionProblema: string
  prioridad: string
  estado: string
  area?: { nombre: string }
  centroCosto?: { codigo: string; nombre: string }
  costoTotal?: number
  tiempoRespuesta?: number
  fechaCierre?: Date
}

interface CentroCosto {
  id: string
  codigo: string
  nombre: string
}

interface Area {
  id: string
  nombre: string
}

export default function ReportesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)

  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    centroCostoId: '',
    areaId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [solRes, ccRes, areasRes] = await Promise.all([
        fetch('/api/solicitudes'),
        fetch('/api/centros-costo'),
        fetch('/api/areas'),
      ])
      const solData = await solRes.json()
      const ccData = await ccRes.json()
      const areasData = await areasRes.json()

      if (solData.success) setSolicitudes(solData.data)
      if (ccData.success) setCentrosCosto(ccData.data)
      if (areasData.success) setAreas(areasData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtros.fechaDesde && new Date(s.fechaSolicitud) < new Date(filtros.fechaDesde)) return false
    if (filtros.fechaHasta && new Date(s.fechaSolicitud) > new Date(filtros.fechaHasta + 'T23:59:59')) return false
    if (filtros.estado && s.estado !== filtros.estado) return false
    if (filtros.centroCostoId && s.centroCosto?.id !== filtros.centroCostoId) return false
    if (filtros.areaId && s.area?.id !== filtros.areaId) return false
    return true
  })

  const estadisticas = {
    total: solicitudesFiltradas.length,
    pendientes: solicitudesFiltradas.filter(s => ['PENDIENTE', 'APROBADA', 'ESPERANDO_INSUMOS', 'INSUMOS_RECIBIDOS', 'EN_EJECUCION'].includes(s.estado)).length,
    cerradas: solicitudesFiltradas.filter(s => s.estado === 'CERRADA').length,
    rechazadas: solicitudesFiltradas.filter(s => s.estado === 'RECHAZADA').length,
    costoTotal: solicitudesFiltradas.reduce((acc, s) => acc + (s.costoTotal || 0), 0),
    tiempoPromedio: solicitudesFiltradas.filter(s => s.tiempoRespuesta).reduce((acc, s, _, arr) => acc + (s.tiempoRespuesta || 0) / arr.length, 0),
  }

  const exportarCSV = () => {
    setGenerando(true)
    try {
      const headers = ['Número', 'Fecha', 'Solicitante', 'Tipo', 'Prioridad', 'Estado', 'Área', 'Centro Costo', 'Costo Total']
      const rows = solicitudesFiltradas.map(s => [
        s.numero,
        new Date(s.fechaSolicitud).toLocaleDateString('es-AR'),
        s.solicitante,
        s.tipoMantenimiento,
        s.prioridad,
        s.estado,
        s.area?.nombre || '',
        s.centroCosto?.nombre || '',
        s.costoTotal?.toString() || '0',
      ])

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_solicitudes_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast({ title: 'Reporte exportado' })
    } catch (error) {
      toast({ title: 'Error al exportar', variant: 'destructive' })
    } finally {
      setGenerando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Análisis y exportación de datos del sistema</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtros.estado} onValueChange={(v) => setFiltros({ ...filtros, estado: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="APROBADA">Aprobada</SelectItem>
                  <SelectItem value="EN_EJECUCION">En Ejecución</SelectItem>
                  <SelectItem value="CERRADA">Cerrada</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Área</Label>
              <Select value={filtros.areaId} onValueChange={(v) => setFiltros({ ...filtros, areaId: v })}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {areas.map((a) => (<SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Centro de Costo</Label>
              <Select value={filtros.centroCostoId} onValueChange={(v) => setFiltros({ ...filtros, centroCostoId: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {centrosCosto.map((c) => (<SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Cerradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.cerradas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              Rechazadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.rechazadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Costo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.costoTotal.toLocaleString('es-AR')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Tiempo Prom.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.tiempoPromedio ? estadisticas.tiempoPromedio.toFixed(1) + 'h' : '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de resultados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>{solicitudesFiltradas.length} registros encontrados</CardDescription>
          </div>
          <Button onClick={exportarCSV} disabled={generando}>
            {generando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Centro Costo</TableHead>
                <TableHead className="text-right">Costo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudesFiltradas.slice(0, 50).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{s.numero}</TableCell>
                  <TableCell>{new Date(s.fechaSolicitud).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>{s.solicitante}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.tipoMantenimiento}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      s.prioridad === 'ALTA' ? 'bg-red-500' :
                      s.prioridad === 'MEDIA' ? 'bg-yellow-500' : 'bg-green-500'
                    }>
                      {s.prioridad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      s.estado === 'CERRADA' ? 'bg-green-100 text-green-700' :
                      s.estado === 'RECHAZADA' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {s.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.area?.nombre || '-'}</TableCell>
                  <TableCell>{s.centroCosto?.nombre || '-'}</TableCell>
                  <TableCell className="text-right">
                    {s.costoTotal ? `$${s.costoTotal.toLocaleString('es-AR')}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {solicitudesFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros con los filtros aplicados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {solicitudesFiltradas.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Mostrando los primeros 50 registros de {solicitudesFiltradas.length} totales. Exporte a CSV para ver todos.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
