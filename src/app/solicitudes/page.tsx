'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Wrench,
  AlertCircle,
  Loader2,
  ChevronRight,
  History,
  FileText,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Solicitud {
  id: string
  numero: string
  fechaSolicitud: Date
  solicitante: string
  tipoMantenimiento: string
  descripcionProblema: string
  prioridad: string
  estado: string
  area?: { id: string; nombre: string }
  equipo?: { id: string; nombre: string; codigo: string }
  centroCosto?: { id: string; codigo: string; nombre: string }
  asignadoA?: { id: string; nombre: string; apellido: string }
  fechaAprobacion?: Date
  aprobadoPor?: string
  fechaInicioTrabajo?: Date
  fechaCierre?: Date
  cerradoPor?: string
  trabajoRealizado?: string
  observacionesCierre?: string
  costoMateriales?: number
  costoManoObra?: number
  costoTotal?: number
  insumosSolicitados: InsumoSolicitado[]
  historialEstados: HistorialEstado[]
}

interface InsumoSolicitado {
  id: string
  materialId: string
  material?: { id: string; nombre: string; codigo: string; unidad: string }
  cantidadSolicitada: number
  cantidadRecibida: number
  estado: string
  fechaSolicitud: Date
  fechaLlegada?: Date
  recibidoPor?: string
  observaciones?: string
}

interface HistorialEstado {
  id: string
  estadoAnterior: string | null
  estadoNuevo: string
  fechaCambio: Date
  usuario?: string
  comentario?: string
}

interface Area {
  id: string
  codigo: string
  nombre: string
}

interface Equipo {
  id: string
  codigo: string
  nombre: string
}

interface Personal {
  id: string
  nombre: string
  apellido: string
}

interface Material {
  id: string
  codigo: string
  nombre: string
  unidad: string
  stockActual: number
}

interface CentroCosto {
  id: string
  codigo: string
  nombre: string
}

const estadoConfig: Record<string, { label: string; color: string; bgColor: string; icon: any; nextActions: string[] }> = {
  PENDIENTE: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock, nextActions: ['APROBADA', 'RECHAZADA'] },
  APROBADA: { label: 'Aprobada', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle2, nextActions: ['ESPERANDO_INSUMOS', 'EN_EJECUCION'] },
  ESPERANDO_INSUMOS: { label: 'Esperando Insumos', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package, nextActions: ['INSUMOS_RECIBIDOS', 'EN_EJECUCION'] },
  INSUMOS_RECIBIDOS: { label: 'Insumos Recibidos', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: Package, nextActions: ['EN_EJECUCION'] },
  EN_EJECUCION: { label: 'En Ejecución', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Wrench, nextActions: ['CERRADA'] },
  CERRADA: { label: 'Cerrada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2, nextActions: [] },
  RECHAZADA: { label: 'Rechazada', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle, nextActions: [] },
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [personal, setPersonal] = useState<Personal[]>([])
  const [materiales, setMateriales] = useState<Material[]>([])
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  // Dialogs
  const [nuevaDialogOpen, setNuevaDialogOpen] = useState(false)
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false)
  const [cambioEstadoDialogOpen, setCambioEstadoDialogOpen] = useState(false)
  const [insumosDialogOpen, setInsumosDialogOpen] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)

  // Forms
  const [nuevaForm, setNuevaForm] = useState({
    solicitante: '',
    areaId: '',
    equipoId: '',
    tipoMantenimiento: 'CORRECTIVO',
    descripcionProblema: '',
    prioridad: 'MEDIA',
    centroCostoId: '',
    observaciones: '',
  })

  const [cambioEstadoForm, setCambioEstadoForm] = useState({
    nuevoEstado: '',
    comentario: '',
    asignadoAId: '',
    trabajoRealizado: '',
    observacionesCierre: '',
    costoMateriales: 0,
    costoManoObra: 0,
  })

  const [insumoForm, setInsumoForm] = useState({
    materialId: '',
    cantidadSolicitada: 1,
    observaciones: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [solRes, areasRes, equiposRes, personalRes, matRes, ccRes] = await Promise.all([
        fetch('/api/solicitudes'),
        fetch('/api/areas'),
        fetch('/api/equipos'),
        fetch('/api/personal'),
        fetch('/api/materiales'),
        fetch('/api/centros-costo'),
      ])
      const solData = await solRes.json()
      const areasData = await areasRes.json()
      const equiposData = await equiposRes.json()
      const personalData = await personalRes.json()
      const matData = await matRes.json()
      const ccData = await ccRes.json()

      if (solData.success) setSolicitudes(solData.data)
      if (areasData.success) setAreas(areasData.data)
      if (equiposData.success) setEquipos(equiposData.data)
      if (personalData.success) setPersonal(personalData.data)
      if (matData.success) setMateriales(matData.data)
      if (ccData.success) setCentrosCosto(ccData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSolicitudes = solicitudes.filter(s => {
    const matchSearch = s.numero.toLowerCase().includes(search.toLowerCase()) ||
      s.solicitante.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcionProblema.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filtroEstado || s.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const handleCreateSolicitud = async () => {
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaForm),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Solicitud creada', description: `Número: ${data.data.numero}` })
        setNuevaDialogOpen(false)
        setNuevaForm({
          solicitante: '',
          areaId: '',
          equipoId: '',
          tipoMantenimiento: 'CORRECTIVO',
          descripcionProblema: '',
          prioridad: 'MEDIA',
          centroCostoId: '',
          observaciones: '',
        })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear la solicitud', variant: 'destructive' })
    }
  }

  const handleCambiarEstado = async () => {
    if (!selectedSolicitud) return

    try {
      const res = await fetch(`/api/solicitudes/${selectedSolicitud.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nuevoEstado: cambioEstadoForm.nuevoEstado,
          comentario: cambioEstadoForm.comentario,
          asignadoAId: cambioEstadoForm.asignadoAId,
          trabajoRealizado: cambioEstadoForm.trabajoRealizado,
          observacionesCierre: cambioEstadoForm.observacionesCierre,
          costoMateriales: cambioEstadoForm.costoMateriales,
          costoManoObra: cambioEstadoForm.costoManoObra,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Estado actualizado' })
        setCambioEstadoDialogOpen(false)
        setSelectedSolicitud(null)
        setCambioEstadoForm({
          nuevoEstado: '',
          comentario: '',
          asignadoAId: '',
          trabajoRealizado: '',
          observacionesCierre: '',
          costoMateriales: 0,
          costoManoObra: 0,
        })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' })
    }
  }

  const handleAgregarInsumo = async () => {
    if (!selectedSolicitud) return

    try {
      const res = await fetch('/api/solicitudes/insumos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitudId: selectedSolicitud.id,
          ...insumoForm,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Insumo agregado' })
        setInsumoForm({ materialId: '', cantidadSolicitada: 1, observaciones: '' })
        // Refresh solicitud
        const solRes = await fetch(`/api/solicitudes/${selectedSolicitud.id}`)
        const solData = await solRes.json()
        if (solData.success) {
          setSelectedSolicitud(solData.data)
        }
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo agregar el insumo', variant: 'destructive' })
    }
  }

  const handleRegistrarLlegadaInsumo = async (insumoId: string, cantidad: number) => {
    try {
      const res = await fetch(`/api/solicitudes/insumos/${insumoId}/llegada`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cantidadRecibida: cantidad,
          recibidoPor: 'Sistema',
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Llegada registrada' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar la llegada', variant: 'destructive' })
    }
  }

  const openDetalle = async (solicitud: Solicitud) => {
    try {
      const res = await fetch(`/api/solicitudes/${solicitud.id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedSolicitud(data.data)
        setDetalleDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching solicitud:', error)
    }
  }

  const openCambioEstado = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setCambioEstadoForm({
      nuevoEstado: '',
      comentario: '',
      asignadoAId: solicitud.asignadoA?.id || '',
      trabajoRealizado: '',
      observacionesCierre: '',
      costoMateriales: 0,
      costoManoObra: 0,
    })
    setCambioEstadoDialogOpen(true)
  }

  const openInsumos = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud)
    setInsumosDialogOpen(true)
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Mantenimiento</h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de solicitudes con control de insumos
          </p>
        </div>
        <Dialog open={nuevaDialogOpen} onOpenChange={setNuevaDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Solicitud de Mantenimiento</DialogTitle>
              <DialogDescription>
                Complete los datos para crear una nueva solicitud
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Solicitante *</Label>
                <Input
                  value={nuevaForm.solicitante}
                  onChange={(e) => setNuevaForm({ ...nuevaForm, solicitante: e.target.value })}
                  placeholder="Nombre del solicitante"
                />
              </div>
              <div className="space-y-2">
                <Label>Área</Label>
                <Select
                  value={nuevaForm.areaId}
                  onValueChange={(value) => setNuevaForm({ ...nuevaForm, areaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Equipo</Label>
                <Select
                  value={nuevaForm.equipoId}
                  onValueChange={(value) => setNuevaForm({ ...nuevaForm, equipoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.codigo} - {e.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Mantenimiento *</Label>
                <Select
                  value={nuevaForm.tipoMantenimiento}
                  onValueChange={(value) => setNuevaForm({ ...nuevaForm, tipoMantenimiento: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                    <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                    <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={nuevaForm.prioridad}
                  onValueChange={(value) => setNuevaForm({ ...nuevaForm, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Centro de Costo</Label>
                <Select
                  value={nuevaForm.centroCostoId}
                  onValueChange={(value) => setNuevaForm({ ...nuevaForm, centroCostoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCosto.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descripción del Problema *</Label>
                <Textarea
                  value={nuevaForm.descripcionProblema}
                  onChange={(e) => setNuevaForm({ ...nuevaForm, descripcionProblema: e.target.value })}
                  placeholder="Describa el problema o trabajo requerido"
                  rows={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  value={nuevaForm.observaciones}
                  onChange={(e) => setNuevaForm({ ...nuevaForm, observaciones: e.target.value })}
                  placeholder="Información adicional"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNuevaDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateSolicitud}>Crear Solicitud</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar solicitudes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {Object.entries(estadoConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-sm">
          {filteredSolicitudes.length} solicitudes
        </Badge>
      </div>

      {/* Tabla de Solicitudes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Prioridad</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.map((solicitud) => {
                const config = estadoConfig[solicitud.estado] || estadoConfig.PENDIENTE
                const Icon = config.icon
                return (
                  <TableRow key={solicitud.id}>
                    <TableCell className="font-mono font-medium">{solicitud.numero}</TableCell>
                    <TableCell>{new Date(solicitud.fechaSolicitud).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>{solicitud.solicitante}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {solicitud.tipoMantenimiento}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {solicitud.descripcionProblema}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={
                        solicitud.prioridad === 'ALTA' ? 'bg-red-500' :
                        solicitud.prioridad === 'MEDIA' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }>
                        {solicitud.prioridad}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${config.bgColor} ${config.color}`}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetalle(solicitud)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {config.nextActions.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCambioEstado(solicitud)}
                            title="Cambiar estado"
                            className="text-green-600"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                        {(solicitud.estado === 'APROBADA' || solicitud.estado === 'ESPERANDO_INSUMOS') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openInsumos(solicitud)}
                            title="Agregar insumos"
                            className="text-orange-600"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredSolicitudes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Solicitud {selectedSolicitud?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Info general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Solicitante</Label>
                  <p className="font-medium">{selectedSolicitud.solicitante}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Solicitud</Label>
                  <p>{new Date(selectedSolicitud.fechaSolicitud).toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Área</Label>
                  <p>{selectedSolicitud.area?.nombre || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Equipo</Label>
                  <p>{selectedSolicitud.equipo?.nombre || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <Badge variant="outline">{selectedSolicitud.tipoMantenimiento}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridad</Label>
                  <Badge className={
                    selectedSolicitud.prioridad === 'ALTA' ? 'bg-red-500' :
                    selectedSolicitud.prioridad === 'MEDIA' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }>
                    {selectedSolicitud.prioridad}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Descripción del Problema</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedSolicitud.descripcionProblema}</p>
              </div>

              {/* Insumos */}
              {selectedSolicitud.insumosSolicitados.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Insumos Solicitados
                  </Label>
                  <div className="mt-2 space-y-2">
                    {selectedSolicitud.insumosSolicitados.map((insumo) => (
                      <div key={insumo.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{insumo.material?.nombre}</span>
                          <span className="text-muted-foreground ml-2">
                            ({insumo.cantidadSolicitada} {insumo.material?.unidad})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {insumo.estado === 'RECIBIDO' ? (
                            <Badge className="bg-green-100 text-green-700">Recibido</Badge>
                          ) : insumo.estado === 'PARCIAL' ? (
                            <Badge className="bg-yellow-100 text-yellow-700">Parcial ({insumo.cantidadRecibida})</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700">Pendiente</Badge>
                          )}
                          {insumo.fechaLlegada && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(insumo.fechaLlegada).toLocaleDateString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historial de estados */}
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial de Estados
                </Label>
                <div className="mt-2 space-y-2">
                  {selectedSolicitud.historialEstados.map((h, idx) => (
                    <div key={h.id} className="flex items-start gap-3 p-2">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        h.estadoNuevo === 'CERRADA' ? 'bg-green-500' :
                        h.estadoNuevo === 'RECHAZADA' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{estadoConfig[h.estadoNuevo]?.label || h.estadoNuevo}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.fechaCambio).toLocaleString('es-AR')}
                          </span>
                        </div>
                        {h.comentario && (
                          <p className="text-sm text-muted-foreground">{h.comentario}</p>
                        )}
                        {h.usuario && (
                          <p className="text-xs text-muted-foreground">por {h.usuario}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Datos de cierre */}
              {selectedSolicitud.estado === 'CERRADA' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-2">Datos de Cierre</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trabajo Realizado:</span>
                      <p>{selectedSolicitud.trabajoRealizado || '-'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cerrado por:</span>
                      <p>{selectedSolicitud.cerradoPor}</p>
                    </div>
                    {selectedSolicitud.costoTotal && (
                      <div>
                        <span className="text-muted-foreground">Costo Total:</span>
                        <p className="font-bold">${selectedSolicitud.costoTotal.toLocaleString('es-AR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalleDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Cambio de Estado */}
      <Dialog open={cambioEstadoDialogOpen} onOpenChange={setCambioEstadoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado</DialogTitle>
            <DialogDescription>
              Solicitud: {selectedSolicitud?.numero}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select
                value={cambioEstadoForm.nuevoEstado}
                onValueChange={(value) => setCambioEstadoForm({ ...cambioEstadoForm, nuevoEstado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSolicitud && estadoConfig[selectedSolicitud.estado]?.nextActions.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estadoConfig[estado]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cambioEstadoForm.nuevoEstado === 'EN_EJECUCION' && (
              <div className="space-y-2">
                <Label>Asignar a</Label>
                <Select
                  value={cambioEstadoForm.asignadoAId}
                  onValueChange={(value) => setCambioEstadoForm({ ...cambioEstadoForm, asignadoAId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar personal" />
                  </SelectTrigger>
                  <SelectContent>
                    {personal.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {cambioEstadoForm.nuevoEstado === 'CERRADA' && (
              <>
                <div className="space-y-2">
                  <Label>Trabajo Realizado</Label>
                  <Textarea
                    value={cambioEstadoForm.trabajoRealizado}
                    onChange={(e) => setCambioEstadoForm({ ...cambioEstadoForm, trabajoRealizado: e.target.value })}
                    placeholder="Describa el trabajo realizado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones de Cierre</Label>
                  <Textarea
                    value={cambioEstadoForm.observacionesCierre}
                    onChange={(e) => setCambioEstadoForm({ ...cambioEstadoForm, observacionesCierre: e.target.value })}
                    placeholder="Observaciones adicionales"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Costo Materiales</Label>
                    <Input
                      type="number"
                      value={cambioEstadoForm.costoMateriales}
                      onChange={(e) => setCambioEstadoForm({ ...cambioEstadoForm, costoMateriales: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Costo Mano de Obra</Label>
                    <Input
                      type="number"
                      value={cambioEstadoForm.costoManoObra}
                      onChange={(e) => setCambioEstadoForm({ ...cambioEstadoForm, costoManoObra: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Comentario</Label>
              <Input
                value={cambioEstadoForm.comentario}
                onChange={(e) => setCambioEstadoForm({ ...cambioEstadoForm, comentario: e.target.value })}
                placeholder="Comentario opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambioEstadoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Insumos */}
      <Dialog open={insumosDialogOpen} onOpenChange={setInsumosDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Insumos</DialogTitle>
            <DialogDescription>
              Solicitud: {selectedSolicitud?.numero}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Agregar insumo */}
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium">Agregar Insumo</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Material</Label>
                  <Select
                    value={insumoForm.materialId}
                    onValueChange={(value) => setInsumoForm({ ...insumoForm, materialId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materiales.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.codigo} - {m.nombre} (Stock: {m.stockActual} {m.unidad})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    value={insumoForm.cantidadSolicitada}
                    onChange={(e) => setInsumoForm({ ...insumoForm, cantidadSolicitada: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <Button onClick={handleAgregarInsumo} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>

            {/* Lista de insumos */}
            {selectedSolicitud && selectedSolicitud.insumosSolicitados.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Insumos Solicitados</h4>
                <div className="space-y-2">
                  {selectedSolicitud.insumosSolicitados.map((insumo) => (
                    <div key={insumo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{insumo.material?.nombre}</span>
                        <div className="text-sm text-muted-foreground">
                          Solicitado: {insumo.cantidadSolicitada} {insumo.material?.unidad}
                          {insumo.cantidadRecibida > 0 && (
                            <span className="ml-2">
                              | Recibido: {insumo.cantidadRecibida}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {insumo.estado === 'RECIBIDO' ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Recibido
                          </Badge>
                        ) : (
                          <>
                            <Badge className="bg-orange-100 text-orange-700">Pendiente</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegistrarLlegadaInsumo(insumo.id, insumo.cantidadSolicitada)}
                            >
                              Llegó
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInsumosDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
