const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    windowSelectHandler: (data) => ipcRenderer.invoke('window-select-handler', data),

    setMonitoring: (callback) => {
        ipcRenderer.on('set-monitoring', (_, status) => {
            callback(status);
        });
    },
});