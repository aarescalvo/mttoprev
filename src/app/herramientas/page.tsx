'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { Wrench, Plus, Search, Edit, Trash2, Loader2, UserCheck, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Herramienta {
  id: string
  codigo: string
  nombre: string
  tipo: string
  estado: string
  ubicacion?: string
  fechaAdquisicion?: Date
  fechaCalibracion?: Date
  proximaCalibracion?: Date
  responsable?: { id: string; nombre: string; apellido: string }
  observaciones?: string
  activo: boolean
}

interface Personal {
  id: string
  nombre: string
  apellido: string
}

const tipoOptions = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'ELECTRICA', label: 'Eléctrica' },
  { value: 'MEDICION', label: 'Medición' },
  { value: 'ESPECIAL', label: 'Especial' },
]

const estadoOptions = [
  { value: 'DISPONIBLE', label: 'Disponible', color: 'bg-green-100 text-green-700' },
  { value: 'EN_USO', label: 'En Uso', color: 'bg-blue-100 text-blue-700' },
  { value: 'MANTENIMIENTO', label: 'En Mantenimiento', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'BAJA', label: 'Dada de Baja', color: 'bg-red-100 text-red-700' },
]

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([])
  const [personal, setPersonal] = useState<Personal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prestamoDialogOpen, setPrestamoDialogOpen] = useState(false)
  const [editingHerramienta, setEditingHerramienta] = useState<Herramienta | null>(null)
  const [selectedHerramienta, setSelectedHerramienta] = useState<Herramienta | null>(null)

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'MANUAL',
    estado: 'DISPONIBLE',
    ubicacion: '',
    fechaAdquisicion: '',
    fechaCalibracion: '',
    proximaCalibracion: '',
    observaciones: '',
  })

  const [prestamoForm, setPrestamoForm] = useState({
    personalId: '',
    observaciones: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [herrRes, persRes] = await Promise.all([
        fetch('/api/herramientas'),
        fetch('/api/personal'),
      ])
      const herrData = await herrRes.json()
      const persData = await persRes.json()

      if (herrData.success) setHerramientas(herrData.data)
      if (persData.success) setPersonal(persData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHerramientas = herramientas.filter(h =>
    h.nombre.toLowerCase().includes(search.toLowerCase()) ||
    h.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setEditingHerramienta(null)
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'MANUAL',
      estado: 'DISPONIBLE',
      ubicacion: '',
      fechaAdquisicion: '',
      fechaCalibracion: '',
      proximaCalibracion: '',
      observaciones: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (herramienta: Herramienta) => {
    setEditingHerramienta(herramienta)
    setFormData({
      codigo: herramienta.codigo,
      nombre: herramienta.nombre,
      tipo: herramienta.tipo,
      estado: herramienta.estado,
      ubicacion: herramienta.ubicacion || '',
      fechaAdquisicion: herramienta.fechaAdquisicion ? new Date(herramienta.fechaAdquisicion).toISOString().split('T')[0] : '',
      fechaCalibracion: herramienta.fechaCalibracion ? new Date(herramienta.fechaCalibracion).toISOString().split('T')[0] : '',
      proximaCalibracion: herramienta.proximaCalibracion ? new Date(herramienta.proximaCalibracion).toISOString().split('T')[0] : '',
      observaciones: herramienta.observaciones || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingHerramienta ? `/api/herramientas/${editingHerramienta.id}` : '/api/herramientas'
      const method = editingHerramienta ? 'PUT' : 'POST'

      const body = {
        ...formData,
        fechaAdquisicion: formData.fechaAdquisicion ? new Date(formData.fechaAdquisicion) : undefined,
        fechaCalibracion: formData.fechaCalibracion ? new Date(formData.fechaCalibracion) : undefined,
        proximaCalibracion: formData.proximaCalibracion ? new Date(formData.proximaCalibracion) : undefined,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: editingHerramienta ? 'Herramienta actualizada' : 'Herramienta creada' })
        setDialogOpen(false)
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta herramienta?')) return

    try {
      const res = await fetch(`/api/herramientas/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Herramienta eliminada' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  const handlePrestamo = async () => {
    if (!selectedHerramienta) return

    try {
      const res = await fetch('/api/herramientas/prestamo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          herramientaId: selectedHerramienta.id,
          ...prestamoForm,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Préstamo registrado' })
        setPrestamoDialogOpen(false)
        setPrestamoForm({ personalId: '', observaciones: '' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar el préstamo', variant: 'destructive' })
    }
  }

  const handleDevolucion = async (herramientaId: string) => {
    try {
      const res = await fetch('/api/herramientas/devolucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ herramientaId }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Devolución registrada' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar la devolución', variant: 'destructive' })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const config = estadoOptions.find(e => e.value === estado) || estadoOptions[0]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getTipoLabel = (tipo: string) => {
    return tipoOptions.find(t => t.value === tipo)?.label || tipo
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Herramientas</h1>
          <p className="text-muted-foreground">Control de herramientas y préstamos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Herramienta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingHerramienta ? 'Editar Herramienta' : 'Nueva Herramienta'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {estadoOptions.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input value={formData.ubicacion} onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha Adquisición</Label>
                <Input type="date" value={formData.fechaAdquisicion} onChange={(e) => setFormData({ ...formData, fechaAdquisicion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Última Calibración</Label>
                <Input type="date" value={formData.fechaCalibracion} onChange={(e) => setFormData({ ...formData, fechaCalibracion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Próxima Calibración</Label>
                <Input type="date" value={formData.proximaCalibracion} onChange={(e) => setFormData({ ...formData, proximaCalibracion: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Observaciones</Label>
                <Textarea value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar herramientas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="outline">{filteredHerramientas.length} herramientas</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Próx. Calibración</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHerramientas.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono">{h.codigo}</TableCell>
                  <TableCell className="font-medium">{h.nombre}</TableCell>
                  <TableCell>{getTipoLabel(h.tipo)}</TableCell>
                  <TableCell className="text-center">{getEstadoBadge(h.estado)}</TableCell>
                  <TableCell>{h.ubicacion || '-'}</TableCell>
                  <TableCell>
                    {h.responsable ? `${h.responsable.nombre} ${h.responsable.apellido}` : '-'}
                  </TableCell>
                  <TableCell>
                    {h.proximaCalibracion ? new Date(h.proximaCalibracion).toLocaleDateString('es-AR') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {h.estado === 'DISPONIBLE' && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedHerramienta(h); setPrestamoDialogOpen(true) }} title="Prestar">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {h.estado === 'EN_USO' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDevolucion(h.id)} title="Devolver" className="text-green-600">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(h)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredHerramientas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron herramientas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de préstamo */}
      <Dialog open={prestamoDialogOpen} onOpenChange={setPrestamoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prestar Herramienta</DialogTitle>
            <DialogDescription>{selectedHerramienta?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asignar a</Label>
              <Select value={prestamoForm.personalId} onValueChange={(value) => setPrestamoForm({ ...prestamoForm, personalId: value })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar personal" /></SelectTrigger>
                <SelectContent>
                  {personal.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={prestamoForm.observaciones} onChange={(e) => setPrestamoForm({ ...prestamoForm, observaciones: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrestamoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePrestamo}>Prestar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
