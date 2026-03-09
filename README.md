# MTOPREV - Sistema de Gestión de Mantenimiento Preventivo

Sistema integral de gestión de mantenimiento para plantas industriales con control de stock, herramientas, personal, solicitudes de mantenimiento y centro de costos.

![MTOPREV Dashboard](docs/dashboard.png)

## 🚀 Características Principales

### Dashboard Principal
- KPIs en tiempo real: solicitudes pendientes, stock bajo, mantenimientos vencidos
- Gráficos de distribución de estados
- Alertas visuales para elementos críticos
- Últimas solicitudes y actividad reciente

### 📦 Stock de Materiales
- Gestión completa de inventario
- Alertas de stock bajo
- Movimientos de entrada/salida
- Asociación a centros de costo

### 🔧 Herramientas
- Control de inventario de herramientas
- Sistema de préstamos y devoluciones
- Registro de calibraciones
- Estados: Disponible, En Uso, Mantenimiento, Baja

### 👥 Personal
- Gestión del equipo de mantenimiento
- Especialidades y turnos
- Historial de trabajos asignados

### 📋 Solicitudes de Mantenimiento (Módulo Principal)
- **Flujo completo de trabajo:**
  1. PENDIENTE → Solicitud creada
  2. APROBADA → Supervisor aprueba
  3. ESPERANDO INSUMOS → Se solicitan materiales
  4. INSUMOS RECIBIDOS → Llegan los materiales
  5. EN EJECUCIÓN → Personal trabaja
  6. CERRADA → Trabajo documentado

- **Seguimiento completo:**
  - Quién solicita y cuándo
  - Quién aprueba y cuándo
  - Insumos requeridos y su llegada
  - Tiempos de respuesta y ejecución
  - Costos asociados

### 📅 Mantenimiento Preventivo
- Registro de equipos
- Cronograma de mantenimientos
- Generación de OTs preventivas
- Alertas de mantenimientos próximos/vencidos

### 💰 Centro de Costos
- Definición de centros de costo
- Presupuestos por área
- Asociación de gastos

### 📊 Reportes
- Filtros por fecha, estado, área
- Exportación a CSV
- Estadísticas de tiempos y costos

## 💻 Tecnologías

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Base de datos:** SQLite con Prisma ORM
- **UI:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts
- **Desktop:** Electron (para versión instalable)

## 📦 Instalación

### Requisitos
- Node.js 20+ o Bun
- Windows 10+ / macOS / Linux

### Modo Desarrollo

```bash
# Clonar el proyecto
git clone https://github.com/su-empresa/mtoprev.git
cd mtoprev

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Cargar datos de ejemplo (opcional)
npx prisma db seed

# Iniciar servidor
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Generar Instalador (.exe)

```bash
# Para Windows
npm run electron:build:win

# Para macOS
npm run electron:build:mac

# Para Linux
npm run electron:build:linux
```

El instalador se generará en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
mtoprev/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── api/               # API Routes
│   │   ├── stock/             # Módulo de stock
│   │   ├── herramientas/      # Módulo de herramientas
│   │   ├── personal/          # Módulo de personal
│   │   ├── solicitudes/       # Módulo de solicitudes
│   │   ├── mantenimientos/    # Módulo de mantenimiento
│   │   ├── centros-costo/     # Módulo de centros de costo
│   │   └── reportes/          # Módulo de reportes
│   ├── components/
│   │   ├── ui/                # Componentes de UI (shadcn)
│   │   └── mtoprev/           # Componentes específicos
│   ├── actions/               # Server Actions
│   └── lib/                   # Utilidades
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   └── seed.ts               # Datos de ejemplo
├── electron/
│   ├── main.js               # Proceso principal de Electron
│   └── preload.js            # Bridge seguro
└── download/
    └── INSTALACION.txt       # Guía detallada de instalación
```

## 🔒 Uso Offline

MTOPREV funciona 100% offline. La base de datos SQLite se almacena localmente:

- **Windows:** `C:\Users\[Usuario]\AppData\Roaming\mtoprev\mtoprev.db`
- **macOS:** `~/Library/Application Support/mtoprev/mtoprev.db`
- **Linux:** `~/.config/mtoprev/mtoprev.db`

## 🌐 Configuración Multi-Equipo

Para compartir la base de datos entre varios equipos:

1. Coloque la base de datos en una carpeta de red
2. Configure la variable `DATABASE_URL` en cada equipo:

```env
DATABASE_URL=file:\\SERVIDOR\MTOPREV\mtoprev.db
```

## 📖 Guía de Instalación

Consulte el archivo [INSTALACION.txt](download/INSTALACION.txt) para instrucciones detalladas sobre:
- Requisitos del sistema
- Instalación para desarrollo
- Generación del instalador
- Instalación en equipos de usuario
- Configuración de red local
- Resolución de problemas

## 📄 Licencia

Este proyecto es propiedad de su organización. Todos los derechos reservados.

---

Desarrollado con ❤️ para la gestión eficiente del mantenimiento industrial.
