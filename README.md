# MTOPREV - Sistema de Gestión de Mantenimiento Preventivo

Sistema integral para gestión de mantenimiento en plantas industriales.

## 📥 Descarga e Instalación

### Para Usuarios (Sin conocimientos técnicos)

1. Vaya a la sección **[Releases](https://github.com/aarescalvo/mttoprev/releases)** en GitHub
2. Descargue el archivo `MTOPREV-Setup-1.0.0.exe`
3. Haga doble clic en el archivo descargado
4. Siga las instrucciones del asistente de instalación
5. Al terminar, haga clic en el icono de MTOPREV en el escritorio

📖 **Guía completa de instalación:** Ver archivo `INSTALACION.txt` en la carpeta `download`

📖 **Manual de uso completo:** Ver archivo `MANUAL_DE_USO.txt` en la carpeta `download`

## 🎯 Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| 📊 **Dashboard** | Pantalla principal con indicadores y alertas |
| 📦 **Stock** | Control de inventario de materiales y repuestos |
| 🔧 **Herramientas** | Gestión de herramientas y préstamos |
| 👥 **Personal** | Administración del equipo de mantenimiento |
| 📋 **Solicitudes** | Gestión completa de solicitudes de trabajo |
| 📅 **Mantenimientos** | Cronograma de mantenimiento preventivo |
| 💰 **Centro de Costos** | Control de gastos por área |
| 📈 **Reportes** | Estadísticas y exportación de datos |

## 📋 Flujo de Solicitudes

```
PENDIENTE → APROBADA → ESPERANDO INSUMOS → INSUMOS RECIBIDOS → EN EJECUCIÓN → CERRADA
```

Cada estado queda registrado con:
- Fecha y hora del cambio
- Usuario responsable
- Comentarios

## 💻 Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema Operativo | Windows 10 (64-bit) | Windows 11 |
| Memoria RAM | 4 GB | 8 GB |
| Espacio en disco | 500 MB | 1 GB |
| Resolución | 1366x768 | 1920x1080 |

## 📁 Documentación Disponible

| Archivo | Descripción |
|---------|-------------|
| `INSTALACION.txt` | Guía paso a paso para instalar el programa |
| `MANUAL_DE_USO.txt` | Manual completo con instrucciones detalladas |

## 🔧 Para Desarrolladores

### Instalación en modo desarrollo

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

### Generar instalador

```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

## 📞 Soporte

Para consultas técnicas, contacte al área de sistemas de su empresa.

---

MTOPREV v1.0.0 - Sistema de Gestión de Mantenimiento Preventivo
