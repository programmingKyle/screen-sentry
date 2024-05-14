const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    openWindowSelection: () => ipcRenderer.invoke('open-window-selection'),
    windowSelection: (data) => ipcRenderer.invoke('window-selection', data),
});