const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectPdf: () => ipcRenderer.invoke('select-pdf'),
  readPdfFile: (filePath) => ipcRenderer.invoke('read-pdf-file', filePath),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  makeApiRequest: (options) => ipcRenderer.invoke('make-api-request', options),
  onOpenPdf: (callback) => {
    const subscription = (event, filePath) => callback(filePath);
    ipcRenderer.on('open-pdf', subscription);
    return () => ipcRenderer.removeListener('open-pdf', subscription);
  },
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
