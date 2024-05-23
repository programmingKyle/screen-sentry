const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    windowSelectHandler: (data) => ipcRenderer.invoke('window-select-handler', data),
    getConfig: () => ipcRenderer.invoke('get-config'),
    inputHandler: (data) => ipcRenderer.invoke('input-handler', data),
    hotkeyHandler: (data) => ipcRenderer.invoke('hotkey-handler', data),
    
    monitoringHandler: (callback) => {
        ipcRenderer.on('monitoring-handler', (_, status) => {
            callback(status);
        });
    },
});

contextBridge.exposeInMainWorld('autoUpdater', {
    autoUpdaterCallback: (callback) => {
        ipcRenderer.on('auto-updater-callback', (_, status) => {
            callback(status);
        });
    },
    restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
    closeApp: () => ipcRenderer.invoke('close-app'),
});