'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, Plus, Search, Edit, Trash2, Loader2, CheckCircle2, Clock, AlertTriangle, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Equipo {
  id: string
  codigo: string
  nombre: string
  marca?: string
  modelo?: string
  ubicacion?: string
  frecuenciaMantenimiento?: number
  ultimoMantenimiento?: Date
  proximoMantenimiento?: Date
  estado: string
  area?: { nombre: string }
  centroCosto?: { codigo: string; nombre: string }
}

interface Mantenimiento {
  id: string
  numeroOT: string
  fechaProgramada: Date
  fechaEjecucion?: Date
  estado: string
  trabajoRealizado?: string
  ejecutadoPor?: string
  equipo: { codigo: string; nombre: string; area?: { nombre: string } }
  centroCosto?: { codigo: string; nombre: string }
}

interface Area {
  id: string
  nombre: string
}

interface CentroCosto {
  id: string
  codigo: string
  nombre: string
}

export default function MantenimientosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [equipoDialogOpen, setEquipoDialogOpen] = useState(false)
  const [mantenimientoDialogOpen, setMantenimientoDialogOpen] = useState(false)
  const [completarDialogOpen, setCompletarDialogOpen] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null)
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null)

  const [equipoForm, setEquipoForm] = useState({
    codigo: '',
    nombre: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    areaId: '',
    ubicacion: '',
    frecuenciaMantenimiento: 30,
    centroCostoId: '',
    estado: 'OPERATIVO',
  })

  const [mantenimientoForm, setMantenimientoForm] = useState({
    equipoId: '',
    fechaProgramada: '',
    centroCostoId: '',
  })

  const [completarForm, setCompletarForm] = useState({
    trabajoRealizado: '',
    ejecutadoPor: '',
    observaciones: '',
    horasTrabajo: 0,
    costoMateriales: 0,
    costoManoObra: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [eqRes, mantRes, areasRes, ccRes] = await Promise.all([
        fetch('/api/equipos'),
        fetch('/api/mantenimientos'),
        fetch('/api/areas'),
        fetch('/api/centros-costo'),
      ])
      const eqData = await eqRes.json()
      const mantData = await mantRes.json()
      const areasData = await areasRes.json()
      const ccData = await ccRes.json()

      if (eqData.success) setEquipos(eqData.data)
      if (mantData.success) setMantenimientos(mantData.data)
      if (areasData.success) setAreas(areasData.data)
      if (ccData.success) setCentrosCosto(ccData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEquipo = async () => {
    try {
      const url = editingEquipo ? `/api/equipos/${editingEquipo.id}` : '/api/equipos'
      const method = editingEquipo ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipoForm),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: editingEquipo ? 'Equipo actualizado' : 'Equipo creado' })
        setEquipoDialogOpen(false)
        setEquipoForm({
          codigo: '', nombre: '', marca: '', modelo: '', numeroSerie: '',
          areaId: '', ubicacion: '', frecuenciaMantenimiento: 30, centroCostoId: '', estado: 'OPERATIVO',
        })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' })
    }
  }

  const handleCreateMantenimiento = async () => {
    try {
      const res = await fetch('/api/mantenimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mantenimientoForm,
          fechaProgramada: new Date(mantenimientoForm.fechaProgramada),
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Mantenimiento programado', description: `OT: ${data.data.numeroOT}` })
        setMantenimientoDialogOpen(false)
        setMantenimientoForm({ equipoId: '', fechaProgramada: '', centroCostoId: '' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear', variant: 'destructive' })
    }
  }

  const handleCompletarMantenimiento = async () => {
    if (!selectedMantenimiento) return

    try {
      const res = await fetch(`/api/mantenimientos/${selectedMantenimiento.id}/completar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completarForm),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Mantenimiento completado' })
        setCompletarDialogOpen(false)
        setSelectedMantenimiento(null)
        setCompletarForm({
          trabajoRealizado: '', ejecutadoPor: '', observaciones: '',
          horasTrabajo: 0, costoMateriales: 0, costoManoObra: 0,
        })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo completar', variant: 'destructive' })
    }
  }

  const deleteEquipo = async (id: string) => {
    if (!confirm('¿Eliminar este equipo?')) return
    try {
      const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Equipo eliminado' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'OPERATIVO': return <Badge className="bg-green-100 text-green-700">Operativo</Badge>
      case 'EN_MANTENIMIENTO': return <Badge className="bg-yellow-100 text-yellow-700">En Mantenimiento</Badge>
      case 'FUERA_SERVICIO': return <Badge className="bg-red-100 text-red-700">Fuera de Servicio</Badge>
      case 'PROGRAMADO': return <Badge className="bg-blue-100 text-blue-700">Programado</Badge>
      case 'EN_EJECUCION': return <Badge className="bg-purple-100 text-purple-700">En Ejecución</Badge>
      case 'COMPLETADO': return <Badge className="bg-green-100 text-green-700">Completado</Badge>
      default: return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const mantenimientosProximos = mantenimientos.filter(m => m.estado === 'PROGRAMADO' && new Date(m.fechaProgramada) >= new Date())
  const mantenimientosVencidos = mantenimientos.filter(m => m.estado === 'PROGRAMADO' && new Date(m.fechaProgramada) < new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mantenimiento Preventivo</h1>
          <p className="text-muted-foreground">Gestión de equipos y cronograma de mantenimiento</p>
        </div>
      </div>

      <Tabs defaultValue="equipos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipos">Equipos</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="equipos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar equipos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={equipoDialogOpen} onOpenChange={setEquipoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingEquipo(null); setEquipoForm({ codigo: '', nombre: '', marca: '', modelo: '', numeroSerie: '', areaId: '', ubicacion: '', frecuenciaMantenimiento: 30, centroCostoId: '', estado: 'OPERATIVO' }) }}>
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Equipo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Código *</Label>
                    <Input value={equipoForm.codigo} onChange={(e) => setEquipoForm({ ...equipoForm, codigo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input value={equipoForm.nombre} onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input value={equipoForm.marca} onChange={(e) => setEquipoForm({ ...equipoForm, marca: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input value={equipoForm.modelo} onChange={(e) => setEquipoForm({ ...equipoForm, modelo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Área</Label>
                    <Select value={equipoForm.areaId} onValueChange={(v) => setEquipoForm({ ...equipoForm, areaId: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {areas.map((a) => (<SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Input value={equipoForm.ubicacion} onChange={(e) => setEquipoForm({ ...equipoForm, ubicacion: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Frecuencia (días)</Label>
                    <Input type="number" value={equipoForm.frecuenciaMantenimiento} onChange={(e) => setEquipoForm({ ...equipoForm, frecuenciaMantenimiento: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Centro de Costo</Label>
                    <Select value={equipoForm.centroCostoId} onValueChange={(v) => setEquipoForm({ ...equipoForm, centroCostoId: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {centrosCosto.map((c) => (<SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={equipoForm.estado} onValueChange={(v) => setEquipoForm({ ...equipoForm, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPERATIVO">Operativo</SelectItem>
                        <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                        <SelectItem value="FUERA_SERVICIO">Fuera de Servicio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEquipoDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveEquipo}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Próx. Mant.</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipos.filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()) || e.codigo.toLowerCase().includes(search.toLowerCase())).map((equipo) => (
                    <TableRow key={equipo.id}>
                      <TableCell className="font-mono">{equipo.codigo}</TableCell>
                      <TableCell className="font-medium">{equipo.nombre}</TableCell>
                      <TableCell>{equipo.marca} {equipo.modelo}</TableCell>
                      <TableCell>{equipo.area?.nombre || '-'}</TableCell>
                      <TableCell>{equipo.ubicacion || '-'}</TableCell>
                      <TableCell>{equipo.frecuenciaMantenimiento ? `${equipo.frecuenciaMantenimiento} días` : '-'}</TableCell>
                      <TableCell>{equipo.proximoMantenimiento ? new Date(equipo.proximoMantenimiento).toLocaleDateString('es-AR') : '-'}</TableCell>
                      <TableCell className="text-center">{getEstadoBadge(equipo.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingEquipo(equipo); setEquipoForm({ codigo: equipo.codigo, nombre: equipo.nombre, marca: equipo.marca || '', modelo: equipo.modelo || '', numeroSerie: '', areaId: equipo.area?.id || '', ubicacion: equipo.ubicacion || '', frecuenciaMantenimiento: equipo.frecuenciaMantenimiento || 30, centroCostoId: equipo.centroCosto?.id || '', estado: equipo.estado }); setEquipoDialogOpen(true) }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteEquipo(equipo.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-red-100 text-red-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {mantenimientosVencidos.length} vencidos
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                {mantenimientosProximos.length} programados
              </Badge>
            </div>
            <Dialog open={mantenimientoDialogOpen} onOpenChange={setMantenimientoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Programar Mantenimiento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programar Mantenimiento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Equipo *</Label>
                    <Select value={mantenimientoForm.equipoId} onValueChange={(v) => setMantenimientoForm({ ...mantenimientoForm, equipoId: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {equipos.map((e) => (<SelectItem key={e.id} value={e.id}>{e.codigo} - {e.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Programada *</Label>
                    <Input type="date" value={mantenimientoForm.fechaProgramada} onChange={(e) => setMantenimientoForm({ ...mantenimientoForm, fechaProgramada: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Centro de Costo</Label>
                    <Select value={mantenimientoForm.centroCostoId} onValueChange={(v) => setMantenimientoForm({ ...mantenimientoForm, centroCostoId: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {centrosCosto.map((c) => (<SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMantenimientoDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateMantenimiento}>Programar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Mantenimientos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OT</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead>Ejecutado Por</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mantenimientos.map((m) => (
                    <TableRow key={m.id} className={m.estado === 'PROGRAMADO' && new Date(m.fechaProgramada) < new Date() ? 'bg-red-50' : ''}>
                      <TableCell className="font-mono">{m.numeroOT}</TableCell>
                      <TableCell className="font-medium">{m.equipo.nombre}</TableCell>
                      <TableCell>{m.equipo.area?.nombre || '-'}</TableCell>
                      <TableCell>{new Date(m.fechaProgramada).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell className="text-center">{getEstadoBadge(m.estado)}</TableCell>
                      <TableCell>{m.ejecutadoPor || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {m.estado === 'PROGRAMADO' && (
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedMantenimiento(m); setCompletarDialogOpen(true) }} title="Completar">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mantenimientos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay mantenimientos programados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog completar */}
      <Dialog open={completarDialogOpen} onOpenChange={setCompletarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Mantenimiento</DialogTitle>
            <CardDescription>OT: {selectedMantenimiento?.numeroOT}</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Trabajo Realizado *</Label>
              <Textarea value={completarForm.trabajoRealizado} onChange={(e) => setCompletarForm({ ...completarForm, trabajoRealizado: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ejecutado Por *</Label>
              <Input value={completarForm.ejecutadoPor} onChange={(e) => setCompletarForm({ ...completarForm, ejecutadoPor: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={completarForm.observaciones} onChange={(e) => setCompletarForm({ ...completarForm, observaciones: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Horas</Label>
                <Input type="number" value={completarForm.horasTrabajo} onChange={(e) => setCompletarForm({ ...completarForm, horasTrabajo: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Costo Materiales</Label>
                <Input type="number" value={completarForm.costoMateriales} onChange={(e) => setCompletarForm({ ...completarForm, costoMateriales: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Costo Mano Obra</Label>
                <Input type="number" value={completarForm.costoManoObra} onChange={(e) => setCompletarForm({ ...completarForm, costoManoObra: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletarDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCompletarMantenimiento}>Completar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
