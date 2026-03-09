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
import { Users, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PersonalItem {
  id: string
  legajo: string
  nombre: string
  apellido: string
  especialidad?: string
  turno?: string
  telefono?: string
  email?: string
  area?: { id: string; nombre: string }
  fechaIngreso?: Date
  activo: boolean
}

interface Area {
  id: string
  nombre: string
}

const especialidades = [
  'MECANICO', 'ELECTRICISTA', 'ELECTRONICO', 'OPERADOR', 'SUPERVISOR', 'TECNICO', 'OTRO'
]

const turnos = ['MAÑANA', 'TARDE', 'NOCHE', 'ROTATIVO']

export default function PersonalPage() {
  const [personal, setPersonal] = useState<PersonalItem[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState<PersonalItem | null>(null)

  const [formData, setFormData] = useState({
    legajo: '',
    nombre: '',
    apellido: '',
    especialidad: '',
    turno: '',
    telefono: '',
    email: '',
    areaId: '',
    fechaIngreso: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [persRes, areasRes] = await Promise.all([
        fetch('/api/personal'),
        fetch('/api/areas'),
      ])
      const persData = await persRes.json()
      const areasData = await areasRes.json()

      if (persData.success) setPersonal(persData.data)
      if (areasData.success) setAreas(areasData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPersonal = personal.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    p.legajo.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setEditingPersonal(null)
    setFormData({
      legajo: '',
      nombre: '',
      apellido: '',
      especialidad: '',
      turno: '',
      telefono: '',
      email: '',
      areaId: '',
      fechaIngreso: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (p: PersonalItem) => {
    setEditingPersonal(p)
    setFormData({
      legajo: p.legajo,
      nombre: p.nombre,
      apellido: p.apellido,
      especialidad: p.especialidad || '',
      turno: p.turno || '',
      telefono: p.telefono || '',
      email: p.email || '',
      areaId: p.area?.id || '',
      fechaIngreso: p.fechaIngreso ? new Date(p.fechaIngreso).toISOString().split('T')[0] : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingPersonal ? `/api/personal/${editingPersonal.id}` : '/api/personal'
      const method = editingPersonal ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fechaIngreso: formData.fechaIngreso ? new Date(formData.fechaIngreso) : undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: editingPersonal ? 'Personal actualizado' : 'Personal creado' })
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
    if (!confirm('¿Está seguro de eliminar este personal?')) return

    try {
      const res = await fetch(`/api/personal/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Personal eliminado' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal</h1>
          <p className="text-muted-foreground">Equipo de mantenimiento</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingPersonal ? 'Editar Personal' : 'Nuevo Personal'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Legajo *</Label>
                <Input value={formData.legajo} onChange={(e) => setFormData({ ...formData, legajo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Especialidad</Label>
                <Select value={formData.especialidad} onValueChange={(value) => setFormData({ ...formData, especialidad: value })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {especialidades.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {turnos.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área</Label>
                <Select value={formData.areaId} onValueChange={(value) => setFormData({ ...formData, areaId: value })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha Ingreso</Label>
                <Input type="date" value={formData.fechaIngreso} onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })} />
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
          <Input placeholder="Buscar personal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="outline">{filteredPersonal.length} personas</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Legajo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonal.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.legajo}</TableCell>
                  <TableCell className="font-medium">{p.nombre} {p.apellido}</TableCell>
                  <TableCell>{p.especialidad || '-'}</TableCell>
                  <TableCell>{p.turno || '-'}</TableCell>
                  <TableCell>{p.area?.nombre || '-'}</TableCell>
                  <TableCell>{p.telefono || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPersonal.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontró personal
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
