'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { AlertTriangle, Package, Plus, Search, Edit, Trash2, ArrowUpDown, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Material {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  stockActual: number
  stockMinimo: number
  unidad: string
  precio?: number
  ubicacion?: string
  activo: boolean
  categoria?: { id: string; nombre: string }
  centroCosto?: { id: string; codigo: string; nombre: string }
}

interface Categoria {
  id: string
  nombre: string
}

interface CentroCosto {
  id: string
  codigo: string
  nombre: string
}

export default function StockPage() {
  const [materiales, setMateriales] = useState<Material[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [movimientoDialogOpen, setMovimientoDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    stockActual: 0,
    stockMinimo: 0,
    unidad: 'unidades',
    precio: 0,
    ubicacion: '',
    centroCostoId: '',
  })

  const [movimientoData, setMovimientoData] = useState({
    tipo: 'ENTRADA' as 'ENTRADA' | 'SALIDA' | 'AJUSTE',
    cantidad: 0,
    motivo: '',
    referencia: '',
    centroCostoId: '',
    usuario: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [matRes, catRes, ccRes] = await Promise.all([
        fetch('/api/materiales'),
        fetch('/api/categorias'),
        fetch('/api/centros-costo'),
      ])
      const matData = await matRes.json()
      const catData = await catRes.json()
      const ccData = await ccRes.json()

      if (matData.success) setMateriales(matData.data)
      if (catData.success) setCategorias(catData.data)
      if (ccData.success) setCentrosCosto(ccData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMateriales = materiales.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    setEditingMaterial(null)
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoriaId: '',
      stockActual: 0,
      stockMinimo: 0,
      unidad: 'unidades',
      precio: 0,
      ubicacion: '',
      centroCostoId: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      codigo: material.codigo,
      nombre: material.nombre,
      descripcion: material.descripcion || '',
      categoriaId: material.categoria?.id || '',
      stockActual: material.stockActual,
      stockMinimo: material.stockMinimo,
      unidad: material.unidad,
      precio: material.precio || 0,
      ubicacion: material.ubicacion || '',
      centroCostoId: material.centroCosto?.id || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editingMaterial ? `/api/materiales/${editingMaterial.id}` : '/api/materiales'
      const method = editingMaterial ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: editingMaterial ? 'Material actualizado' : 'Material creado',
          description: 'Los cambios se guardaron correctamente',
        })
        setDialogOpen(false)
        fetchData()
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el material',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este material?')) return

    try {
      const res = await fetch(`/api/materiales/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Material eliminado' })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  const handleMovimiento = async () => {
    if (!selectedMaterial) return

    try {
      const res = await fetch('/api/materiales/movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: selectedMaterial.id,
          ...movimientoData,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Movimiento registrado' })
        setMovimientoDialogOpen(false)
        setMovimientoData({
          tipo: 'ENTRADA',
          cantidad: 0,
          motivo: '',
          referencia: '',
          centroCostoId: '',
          usuario: '',
        })
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo registrar el movimiento', variant: 'destructive' })
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock de Materiales</h1>
          <p className="text-muted-foreground">
            Gestión de inventario de materiales y suministros
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? 'Editar Material' : 'Nuevo Material'}</DialogTitle>
              <DialogDescription>
                Complete los datos del material
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="MAT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del material"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="centroCosto">Centro de Costo</Label>
                <Select
                  value={formData.centroCostoId}
                  onValueChange={(value) => setFormData({ ...formData, centroCostoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar centro" />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCosto.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockActual">Stock Actual *</Label>
                <Input
                  id="stockActual"
                  type="number"
                  value={formData.stockActual}
                  onChange={(e) => setFormData({ ...formData, stockActual: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad</Label>
                <Input
                  id="unidad"
                  value={formData.unidad}
                  onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                  placeholder="unidades, kg, litros, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  placeholder="Depósito, Estante, Sector, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas de stock bajo */}
      {filteredMateriales.some(m => m.stockActual <= m.stockMinimo) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Materiales con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredMateriales
                .filter(m => m.stockActual <= m.stockMinimo)
                .map(m => (
                  <Badge key={m.id} variant="outline" className="bg-yellow-100 text-yellow-700">
                    {m.nombre}: {m.stockActual} {m.unidad}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredMateriales.length} materiales
        </Badge>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Mínimo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMateriales.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-mono">{material.codigo}</TableCell>
                  <TableCell className="font-medium">{material.nombre}</TableCell>
                  <TableCell>{material.categoria?.nombre || '-'}</TableCell>
                  <TableCell className="text-center">
                    <span className={material.stockActual <= material.stockMinimo ? 'text-red-600 font-bold' : ''}>
                      {material.stockActual}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{material.stockMinimo}</TableCell>
                  <TableCell>{material.unidad}</TableCell>
                  <TableCell className="text-right">
                    {material.precio ? `$${material.precio.toLocaleString('es-AR')}` : '-'}
                  </TableCell>
                  <TableCell>{material.ubicacion || '-'}</TableCell>
                  <TableCell className="text-center">
                    {material.stockActual <= material.stockMinimo ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700">
                        Bajo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMaterial(material)
                          setMovimientoDialogOpen(true)
                        }}
                        title="Registrar movimiento"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMateriales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No se encontraron materiales
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de movimiento */}
      <Dialog open={movimientoDialogOpen} onOpenChange={setMovimientoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.nombre} - Stock actual: {selectedMaterial?.stockActual} {selectedMaterial?.unidad}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select
                value={movimientoData.tipo}
                onValueChange={(value: any) => setMovimientoData({ ...movimientoData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste de Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={movimientoData.cantidad}
                onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input
                value={movimientoData.motivo}
                onChange={(e) => setMovimientoData({ ...movimientoData, motivo: e.target.value })}
                placeholder="Descripción del motivo"
              />
            </div>
            <div className="space-y-2">
              <Label>Referencia</Label>
              <Input
                value={movimientoData.referencia}
                onChange={(e) => setMovimientoData({ ...movimientoData, referencia: e.target.value })}
                placeholder="Número de solicitud, OT, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Centro de Costo</Label>
              <Select
                value={movimientoData.centroCostoId}
                onValueChange={(value) => setMovimientoData({ ...movimientoData, centroCostoId: value })}
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
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                value={movimientoData.usuario}
                onChange={(e) => setMovimientoData({ ...movimientoData, usuario: e.target.value })}
                placeholder="Quien realiza el movimiento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovimientoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleMovimiento}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
