# MTOPREV - Sistema de Gestión de Mantenimiento Preventivo

Sistema integral para gestión de mantenimiento en plantas industriales.

## 📥 DESCARGAS

### Versión 1.0.0 (Actual)

| Sistema Operativo | Archivo | Instrucciones |
|-------------------|---------|---------------|
| **Windows 10/11** | [MTOPREV-1.0.0-Windows-Portable.zip](https://github.com/aarescalvo/mttoprev/releases/download/v1.0.0/MTOPREV-1.0.0-Windows-Portable.zip) | Descomprimir y ejecutar `MTOPREV.exe` |
| **Linux** | [MTOPREV-1.0.0-Linux.AppImage](https://github.com/aarescalvo/mttoprev/releases/download/v1.0.0/MTOPREV-1.0.0-Linux.AppImage) | Dar permisos: `chmod +x MTOPREV-1.0.0.AppImage` y ejecutar |

### 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [INSTALACION.txt](https://github.com/aarescalvo/mttoprev/releases/download/v1.0.0/INSTALACION.txt) | Guía detallada para usuarios sin experiencia |
| [MANUAL_DE_USO.txt](https://github.com/aarescalvo/mttoprev/releases/download/v1.0.0/MANUAL_DE_USO.txt) | Manual completo de uso del programa |

---

## 🎯 Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 📊 **Dashboard** | Pantalla principal con indicadores y alertas |
| 📦 **Stock** | Control de inventario de materiales y repuestos |
| 🔧 **Herramientas** | Gestión de herramientas y préstamos |
| 👥 **Personal** | Administración del equipo de mantenimiento |
| 📋 **Solicitudes** | Gestión completa de solicitudes de trabajo con seguimiento de insumos |
| 📅 **Mantenimientos** | Cronograma de mantenimiento preventivo |
| 💰 **Centro de Costos** | Control de gastos por área |
| 📈 **Reportes** | Estadísticas y exportación de datos |

---

## 📋 Flujo de Solicitudes de Mantenimiento

```
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
│  PENDIENTE  │───▶│  APROBADA   │───▶│ ESPERANDO INSUMOS│
└─────────────┘    └─────────────┘    └──────────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CERRADA   │◀───│   EN EJECUCIÓN   │◀───│INSUMOS RECIBIDOS│
└─────────────┘    └──────────────────┘    └─────────────────┘
```

Cada estado queda registrado con:
- Fecha y hora del cambio
- Usuario responsable
- Comentarios

---

## 💻 Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema Operativo | Windows 10 (64-bit) | Windows 11 |
| Memoria RAM | 4 GB | 8 GB |
| Espacio en disco | 500 MB | 1 GB |
| Resolución | 1366x768 | 1920x1080 |

---

## 🚀 Instalación Rápida

### Windows:
1. Descargue el archivo ZIP
2. Descomprima en cualquier carpeta
3. Haga doble clic en `MTOPREV.exe`
4. ¡Listo! El programa se abrirá

### Linux:
1. Descargue el archivo AppImage
2. Abra una terminal en la carpeta de descarga
3. Ejecute: `chmod +x MTOPREV-1.0.0-Linux.AppImage`
4. Ejecute: `./MTOPREV-1.0.0-Linux.AppImage`

---

## 🔧 Para Desarrolladores

### Instalación en modo desarrollo:

```bash
# Clonar repositorio
git clone https://github.com/aarescalvo/mttoprev.git
cd mttoprev

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Cargar datos de ejemplo (opcional)
npx prisma db seed

# Iniciar en modo desarrollo
npm run dev
```

### Generar instaladores:

```bash
# Linux
npm run electron:build:linux

# Windows (requiere Windows o Wine)
npm run electron:build:win
```

---

## 📁 Estructura del Proyecto

```
mtoprev/
├── src/
│   ├── app/                 # Páginas Next.js
│   │   ├── stock/          # Módulo de stock
│   │   ├── herramientas/   # Módulo de herramientas
│   │   ├── personal/       # Módulo de personal
│   │   ├── solicitudes/    # Módulo de solicitudes
│   │   ├── mantenimientos/ # Módulo de mantenimientos
│   │   ├── centros-costo/  # Módulo de centro de costos
│   │   └── reportes/       # Módulo de reportes
│   ├── actions/            # Server Actions
│   └── components/         # Componentes React
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
├── electron/
│   └── main.js             # Configuración Electron
└── download/
    ├── INSTALACION.txt     # Guía de instalación
    └── MANUAL_DE_USO.txt   # Manual de usuario
```

---

## 📞 Soporte

Para consultas técnicas, consulte los documentos de instalación y uso incluidos en el release.

---

MTOPREV v1.0.0 - Sistema de Gestión de Mantenimiento Preventivo
