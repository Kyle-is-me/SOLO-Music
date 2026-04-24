const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  getAudioMetadata: (filePath) => ipcRenderer.invoke('get-audio-metadata', filePath),
  readLyricFile: (filePath) => ipcRenderer.invoke('read-lyric-file', filePath),
  findLyricFile: (audioFilePath) => ipcRenderer.invoke('find-lyric-file', audioFilePath),
  scanFolder: (folderPath) => ipcRenderer.invoke('scan-folder', folderPath),
  openLyricDialog: () => ipcRenderer.invoke('open-lyric-dialog'),
  savePlaylist: (data) => ipcRenderer.invoke('save-playlist', data),
  loadPlaylist: () => ipcRenderer.invoke('load-playlist'),
  httpRequest: (options) => ipcRenderer.invoke('http-request', options),
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key)
});
