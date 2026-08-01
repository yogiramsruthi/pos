const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const webUrl = process.env.POS_WEB_URL || 'http://localhost:5173';
  mainWindow.loadURL(webUrl);
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('printer:get-config', async () => ({
  width: process.env.PRINTER_WIDTH_MM || '58',
  interface: process.env.PRINTER_INTERFACE || 'tcp://127.0.0.1:9100'
}));
