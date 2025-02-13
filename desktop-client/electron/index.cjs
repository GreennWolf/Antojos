const { app, BrowserWindow, ipcMain } = require('electron');
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
    // Por ejemplo, para forzar actualización de la interfaz
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('get-printers', async () => {
  try {
    return mainWindow.webContents.getPrintersAsync();
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
});

ipcMain.handle('get-window-focus', () => {
  return mainWindow.isFocused();
});

// Nuevo canal IPC para imprimir el ticket de zona
ipcMain.on('print-ticket-zona', (event, { htmlContent, printerName }) => {
  // Creamos una ventana oculta para la impresión
  let printWindow = new BrowserWindow({
    width: 300,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Cargamos el HTML generado
  printWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(htmlContent));

  printWindow.webContents.on("did-finish-load", () => {
    printWindow.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: printerName, // Nombre de la impresora asignada a esa zona
    }, (success, errorType) => {
      if (!success) {
        console.error("Error de impresión:", errorType);
      }
      printWindow.close();
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
