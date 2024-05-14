const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');

let mainWindow;
let selectionWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let maximized;
ipcMain.handle('frame-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'Minimize':
      mainWindow.minimize();
      break;
    case 'Maximize':
      toggleMaximize();
      break;
    case 'Exit':
      mainWindow.close();
      break;
    }
});

function toggleMaximize(){
  if (maximized){
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
  maximized = !maximized;
}


//
//
let selectionWindows = [];

function createSelectionWindows() {
  const displays = screen.getAllDisplays();

  displays.forEach(display => {
    const { x, y, width, height } = display.bounds;

    let selectionWindow = new BrowserWindow({
      x,
      y,
      width,
      height,
      resizable: false,
      alwaysOnTop: true,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
      }
    });

    selectionWindow.loadFile(path.join(__dirname, 'selection.html'));

    selectionWindow.webContents.on('did-finish-load', () => {
      selectionWindow.webContents.send('window-size', { width, height });
    });

    selectionWindow.on('closed', () => {
      selectionWindow = null;
    });

    selectionWindows.push(selectionWindow);
  });
}

ipcMain.handle('window-select-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'openSelection':
      createSelectionWindows();
      break;
    case 'select':
      windowSelection(data.selection);
      break;
    case 'close':
      closeWindowSelection();
  }
});

function windowSelection(selection){
  console.log(selection);
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
}

function closeWindowSelection(){
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
}