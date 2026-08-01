const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  getPrinterConfig: () => ipcRenderer.invoke('printer:get-config')
});
