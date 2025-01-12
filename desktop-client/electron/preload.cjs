const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    getPrinters: async () => {
      try {
        return await ipcRenderer.invoke('get-printers');
      } catch (error) {
        console.error('Error getting printers:', error);
        return [];
      }
    },
    // Agregar funciones para el manejo del foco
    toggleWindowFocus: () => ipcRenderer.send('focus-fix'),
    onWindowBlur: (callback) => ipcRenderer.on('window-blur', callback),
    onWindowFocus: (callback) => ipcRenderer.on('window-focus', callback),
    onForceUpdate: (callback) => ipcRenderer.on('force-update', callback),
    isWindowFocused: () => ipcRenderer.invoke('get-window-focus'),
    removeListeners: () => {
      ipcRenderer.removeAllListeners('window-blur');
      ipcRenderer.removeAllListeners('window-focus');
      ipcRenderer.removeAllListeners('force-update');
    }
  }
);