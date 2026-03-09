import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos de ejemplo...')

  // Crear Centros de Costo
  const centroProduccion = await prisma.centroCosto.create({
    data: {
      codigo: 'CC-001',
      nombre: 'Producción',
      descripcion: 'Área de producción principal',
      presupuesto: 500000,
    },
  })

  const centroMantenimiento = await prisma.centroCosto.create({
    data: {
      codigo: 'CC-002',
      nombre: 'Mantenimiento',
      descripcion: 'Departamento de mantenimiento',
      presupuesto: 200000,
    },
  })

  const centroLogistica = await prisma.centroCosto.create({
    data: {
      codigo: 'CC-003',
      nombre: 'Logística',
      descripcion: 'Área de logística y almacenamiento',
      presupuesto: 150000,
    },
  })

  console.log('✅ Centros de costo creados')

  // Crear Áreas
  const areaProduccion = await prisma.area.create({
    data: {
      codigo: 'AR-001',
      nombre: 'Producción',
      descripcion: 'Área de producción',
    },
  })

  const areaAlmacen = await prisma.area.create({
    data: {
      codigo: 'AR-002',
      nombre: 'Almacén',
      descripcion: 'Área de almacenamiento',
    },
  })

  const areaOficinas = await prisma.area.create({
    data: {
      codigo: 'AR-003',
      nombre: 'Oficinas',
      descripcion: 'Área administrativa',
    },
  })

  console.log('✅ Áreas creadas')

  // Crear Categorías de Materiales
  const categoriaElectricos = await prisma.categoriaMaterial.create({
    data: {
      nombre: 'Eléctricos',
      descripcion: 'Materiales eléctricos',
    },
  })

  const categoriaMecanicos = await prisma.categoriaMaterial.create({
    data: {
      nombre: 'Mecánicos',
      descripcion: 'Materiales mecánicos',
    },
  })

  const categoriaConsumibles = await prisma.categoriaMaterial.create({
    data: {
      nombre: 'Consumibles',
      descripcion: 'Materiales de consumo general',
    },
  })

  console.log('✅ Categorías creadas')

  // Crear Materiales
  await prisma.material.createMany({
    data: [
      {
        codigo: 'MAT-001',
        nombre: 'Cable eléctrico 2.5mm',
        descripcion: 'Cable de cobre 2.5mm²',
        categoriaId: categoriaElectricos.id,
        stockActual: 500,
        stockMinimo: 100,
        unidad: 'metros',
        precio: 150,
        ubicacion: 'Depósito A - Estante 1',
        centroCostoId: centroMantenimiento.id,
      },
      {
        codigo: 'MAT-002',
        nombre: 'Fusibles 10A',
        descripcion: 'Fusibles cerámicos 10 amperios',
        categoriaId: categoriaElectricos.id,
        stockActual: 50,
        stockMinimo: 20,
        unidad: 'unidades',
        precio: 50,
        ubicacion: 'Depósito A - Estante 2',
        centroCostoId: centroMantenimiento.id,
      },
      {
        codigo: 'MAT-003',
        nombre: 'Rodamiento 6205',
        descripcion: 'Rodamiento rígido de bolas 6205',
        categoriaId: categoriaMecanicos.id,
        stockActual: 10,
        stockMinimo: 15,
        unidad: 'unidades',
        precio: 850,
        ubicacion: 'Depósito B - Estante 1',
        centroCostoId: centroMantenimiento.id,
      },
      {
        codigo: 'MAT-004',
        nombre: 'Aceite hidráulico',
        descripcion: 'Aceite hidráulico ISO 46 - 20L',
        categoriaId: categoriaConsumibles.id,
        stockActual: 5,
        stockMinimo: 3,
        unidad: 'bidones',
        precio: 4500,
        ubicacion: 'Depósito C',
        centroCostoId: centroMantenimiento.id,
      },
      {
        codigo: 'MAT-005',
        nombre: 'Guantes de seguridad',
        descripcion: 'Guantes de cuero para trabajo pesado',
        categoriaId: categoriaConsumibles.id,
        stockActual: 20,
        stockMinimo: 10,
        unidad: 'pares',
        precio: 350,
        ubicacion: 'Depósito A - Estante 3',
        centroCostoId: centroMantenimiento.id,
      },
      {
        codigo: 'MAT-006',
        nombre: 'Lámpara LED 20W',
        descripcion: 'Lámpara LED industrial 20W',
        categoriaId: categoriaElectricos.id,
        stockActual: 30,
        stockMinimo: 15,
        unidad: 'unidades',
        precio: 1200,
        ubicacion: 'Depósito A - Estante 1',
        centroCostoId: centroMantenimiento.id,
      },
    ],
  })

  console.log('✅ Materiales creados')

  // Crear Personal
  const juan = await prisma.personal.create({
    data: {
      legajo: 'LEG-001',
      nombre: 'Juan',
      apellido: 'Pérez',
      especialidad: 'MECANICO',
      turno: 'MAÑANA',
      telefono: '11-1234-5678',
      email: 'jperez@empresa.com',
      areaId: areaProduccion.id,
      fechaIngreso: new Date('2020-03-15'),
    },
  })

  const maria = await prisma.personal.create({
    data: {
      legajo: 'LEG-002',
      nombre: 'María',
      apellido: 'Gómez',
      especialidad: 'ELECTRICISTA',
      turno: 'MAÑANA',
      telefono: '11-2345-6789',
      email: 'mgomez@empresa.com',
      areaId: areaProduccion.id,
      fechaIngreso: new Date('2019-07-20'),
    },
  })

  const carlos = await prisma.personal.create({
    data: {
      legajo: 'LEG-003',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      especialidad: 'SUPERVISOR',
      turno: 'MAÑANA',
      telefono: '11-3456-7890',
      email: 'crodriguez@empresa.com',
      areaId: areaProduccion.id,
      fechaIngreso: new Date('2018-01-10'),
    },
  })

  console.log('✅ Personal creado')

  // Crear Equipos
  const equipo1 = await prisma.equipo.create({
    data: {
      codigo: 'EQ-001',
      nombre: 'Compresor Principal',
      marca: 'Atlas Copco',
      modelo: 'GA37',
      numeroSerie: 'AC-2023-001',
      areaId: areaProduccion.id,
      ubicacion: 'Sala de compresores',
      centroCostoId: centroProduccion.id,
      frecuenciaMantenimiento: 30,
      estado: 'OPERATIVO',
    },
  })

  const equipo2 = await prisma.equipo.create({
    data: {
      codigo: 'EQ-002',
      nombre: 'Puente Grúa 5T',
      marca: 'Demag',
      modelo: 'EKKE',
      numeroSerie: 'DM-2022-015',
      areaId: areaProduccion.id,
      ubicacion: 'Nave principal',
      centroCostoId: centroProduccion.id,
      frecuenciaMantenimiento: 90,
      estado: 'OPERATIVO',
    },
  })

  const equipo3 = await prisma.equipo.create({
    data: {
      codigo: 'EQ-003',
      nombre: 'Centro de Mecanizado CNC',
      marca: 'Haas',
      modelo: 'VF-2',
      numeroSerie: 'HS-2021-089',
      areaId: areaProduccion.id,
      ubicacion: 'Taller de mecanizado',
      centroCostoId: centroProduccion.id,
      frecuenciaMantenimiento: 15,
      estado: 'OPERATIVO',
    },
  })

  console.log('✅ Equipos creados')

  // Crear Herramientas
  await prisma.herramienta.createMany({
    data: [
      {
        codigo: 'HER-001',
        nombre: 'Taladro percutor',
        tipo: 'ELECTRICA',
        estado: 'DISPONIBLE',
        ubicacion: 'Depósito de herramientas',
        fechaAdquisicion: new Date('2022-01-15'),
      },
      {
        codigo: 'HER-002',
        nombre: 'Soldadora inverter',
        tipo: 'ELECTRICA',
        estado: 'DISPONIBLE',
        ubicacion: 'Depósito de herramientas',
        fechaAdquisicion: new Date('2021-06-20'),
      },
      {
        codigo: 'HER-003',
        nombre: 'Multímetro digital',
        tipo: 'MEDICION',
        estado: 'DISPONIBLE',
        ubicacion: 'Depósito de herramientas',
        fechaAdquisicion: new Date('2023-03-10'),
        fechaCalibracion: new Date('2024-01-15'),
        proximaCalibracion: new Date('2025-01-15'),
      },
      {
        codigo: 'HER-004',
        nombre: 'Llave dinamométrica',
        tipo: 'MEDICION',
        estado: 'EN_USO',
        ubicacion: 'Taller de mecanizado',
        fechaAdquisicion: new Date('2022-08-05'),
        responsableId: juan.id,
      },
      {
        codigo: 'HER-005',
        nombre: 'Set de llaves combinadas',
        tipo: 'MANUAL',
        estado: 'DISPONIBLE',
        ubicacion: 'Depósito de herramientas',
        fechaAdquisicion: new Date('2020-11-30'),
      },
    ],
  })

  console.log('✅ Herramientas creadas')

  // Crear Solicitudes de ejemplo
  const solicitud1 = await prisma.solicitudMantenimiento.create({
    data: {
      numero: 'SOL-000001',
      solicitante: 'Carlos Rodríguez',
      areaId: areaProduccion.id,
      equipoId: equipo1.id,
      tipoMantenimiento: 'CORRECTIVO',
      descripcionProblema: 'El compresor presenta ruidos anormales y vibración excesiva en el arranque.',
      prioridad: 'ALTA',
      estado: 'PENDIENTE',
      centroCostoId: centroProduccion.id,
    },
  })

  await prisma.historialEstadoSolicitud.create({
    data: {
      solicitudId: solicitud1.id,
      estadoAnterior: null,
      estadoNuevo: 'PENDIENTE',
      usuario: 'Carlos Rodríguez',
      comentario: 'Solicitud creada',
    },
  })

  const solicitud2 = await prisma.solicitudMantenimiento.create({
    data: {
      numero: 'SOL-000002',
      solicitante: 'María Gómez',
      areaId: areaAlmacen.id,
      tipoMantenimiento: 'PREVENTIVO',
      descripcionProblema: 'Revisión periódica de instalación eléctrica del almacén.',
      prioridad: 'MEDIA',
      estado: 'APROBADA',
      fechaAprobacion: new Date(),
      aprobadoPor: 'Supervisor',
      centroCostoId: centroLogistica.id,
    },
  })

  await prisma.historialEstadoSolicitud.createMany({
    data: [
      {
        solicitudId: solicitud2.id,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        usuario: 'María Gómez',
        comentario: 'Solicitud creada',
      },
      {
        solicitudId: solicitud2.id,
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'APROBADA',
        usuario: 'Supervisor',
        comentario: 'Solicitud aprobada para ejecución',
      },
    ],
  })

  const solicitud3 = await prisma.solicitudMantenimiento.create({
    data: {
      numero: 'SOL-000003',
      solicitante: 'Juan Pérez',
      areaId: areaProduccion.id,
      equipoId: equipo3.id,
      tipoMantenimiento: 'EMERGENCIA',
      descripcionProblema: 'Parada de emergencia del CNC. Error en el sistema de refrigeración.',
      prioridad: 'ALTA',
      estado: 'CERRADA',
      fechaAprobacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      aprobadoPor: 'Supervisor',
      fechaInicioTrabajo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fechaCierre: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      cerradoPor: 'Juan Pérez',
      trabajoRealizado: 'Se reparó la bomba de refrigeración y se reemplazó el termostato.',
      observacionesCierre: 'Se recomienda revisar el sistema en 15 días.',
      centroCostoId: centroProduccion.id,
      costoMateriales: 15000,
      costoManoObra: 5000,
      costoTotal: 20000,
      tiempoRespuesta: 2,
    },
  })

  await prisma.historialEstadoSolicitud.createMany({
    data: [
      {
        solicitudId: solicitud3.id,
        estadoAnterior: null,
        estadoNuevo: 'PENDIENTE',
        usuario: 'Juan Pérez',
        comentario: 'Solicitud creada - Emergencia',
      },
      {
        solicitudId: solicitud3.id,
        estadoAnterior: 'PENDIENTE',
        estadoNuevo: 'APROBADA',
        usuario: 'Supervisor',
        comentario: 'Aprobación inmediata',
      },
      {
        solicitudId: solicitud3.id,
        estadoAnterior: 'APROBADA',
        estadoNuevo: 'EN_EJECUCION',
        usuario: 'Juan Pérez',
        comentario: 'Iniciando reparación',
      },
      {
        solicitudId: solicitud3.id,
        estadoAnterior: 'EN_EJECUCION',
        estadoNuevo: 'CERRADA',
        usuario: 'Juan Pérez',
        comentario: 'Reparación completada',
      },
    ],
  })

  console.log('✅ Solicitudes creadas')

  // Crear Mantenimientos Preventivos
  await prisma.mantenimientoPreventivo.createMany({
    data: [
      {
        numeroOT: 'OT-000001',
        equipoId: equipo1.id,
        fechaProgramada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estado: 'PROGRAMADO',
        centroCostoId: centroProduccion.id,
      },
      {
        numeroOT: 'OT-000002',
        equipoId: equipo2.id,
        fechaProgramada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        estado: 'PROGRAMADO',
        centroCostoId: centroProduccion.id,
      },
      {
        numeroOT: 'OT-000003',
        equipoId: equipo3.id,
        fechaProgramada: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estado: 'PROGRAMADO',
        centroCostoId: centroProduccion.id,
      },
    ],
  })

  console.log('✅ Mantenimientos preventivos creados')

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
