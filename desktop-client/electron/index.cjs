const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
  });

  mainWindow.on('show', () => {
    // También manejar cuando la ventana se muestra
    setTimeout(() => {
      mainWindow.webContents.send('force-update');
    }, 100);
  });

  ipcMain.on('focus-fix', () => {
    mainWindow.blur();
    mainWindow.focus();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }
}

// Handle para obtener impresoras
ipcMain.handle('get-printers', async () => {
  try {
    return mainWindow.webContents.getPrintersAsync();
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
});

// Agrega un manejador específico para el foco
ipcMain.handle('get-window-focus', () => {
  return mainWindow.isFocused();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});