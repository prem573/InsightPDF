const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectPdf: () => ipcRenderer.invoke('select-pdf'),
  getStartPdfPath: () => ipcRenderer.invoke('get-start-pdf-path'),
  readPdfFile: (filePath) => ipcRenderer.invoke('read-pdf-file', filePath),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  makeApiRequest: (options) => ipcRenderer.invoke('make-api-request', options),
  makeStreamingApiRequest: (options, onChunk, onDone, onError) => {
    const requestId = 'req-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const chunkListener = (event, data) => {
      onChunk(data);
    };
    
    const doneListener = (event) => {
      ipcRenderer.removeListener(`stream-chunk-${requestId}`, chunkListener);
      ipcRenderer.removeListener(`stream-done-${requestId}`, doneListener);
      ipcRenderer.removeListener(`stream-error-${requestId}`, errorListener);
      onDone();
    };
    
    const errorListener = (event, data) => {
      ipcRenderer.removeListener(`stream-chunk-${requestId}`, chunkListener);
      ipcRenderer.removeListener(`stream-done-${requestId}`, doneListener);
      ipcRenderer.removeListener(`stream-error-${requestId}`, errorListener);
      onError(new Error(data.error));
    };
    
    ipcRenderer.on(`stream-chunk-${requestId}`, chunkListener);
    ipcRenderer.on(`stream-done-${requestId}`, doneListener);
    ipcRenderer.on(`stream-error-${requestId}`, errorListener);
    
    ipcRenderer.send('make-streaming-api-request', { requestId, ...options });
    
    return () => {
      ipcRenderer.send('cancel-streaming-api-request', { requestId });
      ipcRenderer.removeListener(`stream-chunk-${requestId}`, chunkListener);
      ipcRenderer.removeListener(`stream-done-${requestId}`, doneListener);
      ipcRenderer.removeListener(`stream-error-${requestId}`, errorListener);
    };
  },
  onOpenPdf: (callback) => {
    const subscription = (event, filePath) => callback(filePath);
    ipcRenderer.on('open-pdf', subscription);
    return () => ipcRenderer.removeListener('open-pdf', subscription);
  },
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateAvailable: (callback) => {
    const sub = (event, info) => callback(info);
    ipcRenderer.on('update-available', sub);
    return () => ipcRenderer.removeListener('update-available', sub);
  },
  onUpdateNotAvailable: (callback) => {
    const sub = (event, info) => callback(info);
    ipcRenderer.on('update-not-available', sub);
    return () => ipcRenderer.removeListener('update-not-available', sub);
  },
  onUpdateDownloaded: (callback) => {
    const sub = (event, info) => callback(info);
    ipcRenderer.on('update-downloaded', sub);
    return () => ipcRenderer.removeListener('update-downloaded', sub);
  },
  onUpdateError: (callback) => {
    const sub = (event, err) => callback(err);
    ipcRenderer.on('update-error', sub);
    return () => ipcRenderer.removeListener('update-error', sub);
  }
});
