const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Determinar la ruta de la base de datos
function getDatabasePath() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'mtoprev.db')
  
  // Si es la primera vez, copiar la base de datos vacía
  if (!fs.existsSync(dbPath)) {
    const templatePath = path.join(process.resourcesPath, 'prisma', 'mtoprev.db')
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, dbPath)
    }
  }
  
  return dbPath
}

// Configurar variables de entorno antes de cargar la app
const dbPath = getDatabasePath()
process.env.DATABASE_URL = `file:${dbPath}`

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MTOPREV - Sistema de Gestión de Mantenimiento',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // Cargar la aplicación Next.js
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../.next/server/app/index.html'))
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Crear menú
  const menuTemplate = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Solicitud',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('navigate', '/solicitudes')
        },
        { type: 'separator' },
        {
          label: 'Exportar Datos',
          click: () => mainWindow.webContents.send('export-data')
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Pantalla Completa', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Dashboard', click: () => mainWindow.webContents.send('navigate', '/') },
        { label: 'Stock', click: () => mainWindow.webContents.send('navigate', '/stock') },
        { label: 'Solicitudes', click: () => mainWindow.webContents.send('navigate', '/solicitudes') },
        { label: 'Mantenimientos', click: () => mainWindow.webContents.send('navigate', '/mantenimientos') },
        { label: 'Reportes', click: () => mainWindow.webContents.send('navigate', '/reportes') }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Base de Datos',
          submenu: [
            {
              label: 'Crear Backup',
              click: async () => {
                const { filePath } = await dialog.showSaveDialog(mainWindow, {
                  title: 'Guardar Backup',
                  defaultPath: `mtoprev_backup_${new Date().toISOString().split('T')[0]}.db`,
                  filters: [{ name: 'Base de Datos', extensions: ['db'] }]
                })
                if (filePath) {
                  fs.copyFileSync(dbPath, filePath)
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Backup Completado',
                    message: 'El backup se realizó correctamente.'
                  })
                }
              }
            },
            {
              label: 'Restaurar Backup',
              click: async () => {
                const { filePaths } = await dialog.showOpenDialog(mainWindow, {
                  title: 'Seleccionar Backup',
                  filters: [{ name: 'Base de Datos', extensions: ['db'] }],
                  properties: ['openFile']
                })
                if (filePaths && filePaths[0]) {
                  const result = await dialog.showMessageBox(mainWindow, {
                    type: 'warning',
                    title: 'Confirmar Restauración',
                    message: '¿Está seguro? Los datos actuales serán reemplazados.',
                    buttons: ['Cancelar', 'Restaurar']
                  })
                  if (result.response === 1) {
                    fs.copyFileSync(filePaths[0], dbPath)
                    dialog.showMessageBox(mainWindow, {
                      type: 'info',
                      title: 'Restauración Completada',
                      message: 'La base de datos fue restaurada. Reinicie la aplicación.'
                    })
                  }
                }
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'DevTools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de MTOPREV',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de MTOPREV',
              message: 'MTOPREV v1.0.0',
              detail: 'Sistema de Gestión de Mantenimiento Preventivo\n\nDesarrollado para plantas industriales.\n\n© 2024 MTOPREV'
            })
          }
        },
        {
          label: 'Manual de Usuario',
          click: () => shell.openExternal('https://github.com/mtoprev/manual')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-database-path', () => dbPath)
ipcMain.handle('get-app-version', () => app.getVersion())
ipcMain.handle('get-user-data-path', () => app.getPath('userData'))

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Manejar cierre en Windows
app.on('before-quit', () => {
  if (process.platform === 'win32') {
    mainWindow = null
  }
})
