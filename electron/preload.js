const { contextBridge, ipcRenderer } = require('electron')

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Información del sistema
  getDatabasePath: () => ipcRenderer.invoke('get-database-path'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // Navegación
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, route) => callback(route)),
  
  // Exportación
  onExportData: (callback) => ipcRenderer.on('export-data', () => callback())
})

// Indicar que estamos en Electron
window.isElectron = true
