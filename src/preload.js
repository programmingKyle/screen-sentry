const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    windowSelectHandler: (data) => ipcRenderer.invoke('window-select-handler', data),

    monitoringHandler: (callback) => {
        ipcRenderer.on('monitoring-handler', (_, status) => {
            callback(status);
        });
    },
});