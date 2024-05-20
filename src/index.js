const { app, BrowserWindow, ipcMain, screen, desktopCapturer, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');
const appDataPath = app.getPath('userData');
const Store = require('electron-store');
const store = new Store();

const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

let mainWindow;
let selectionWindow;
let detectionThreshold;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const { width, height, x, y } = store.get('windowBounds', { width: 300, height: 300, x: 0, y: 0 });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width, 
    height: height,
    maximizable: false,
    x: x,
    y: y,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('resize', () => {
    const { width: newWidth, height: newHeight } = mainWindow.getBounds();
    store.set('windowBounds', { width: newWidth, height: newHeight, x: mainWindow.getPosition()[0], y: mainWindow.getPosition()[1], isMaximized: false });
  });
  
  mainWindow.on('move', () => {
    const [newX, newY] = mainWindow.getPosition();
    store.set('windowBounds', { width, height, x: newX, y: newY, isMaximized: false });
    frameMaximized = false;
  });

  mainWindow.once('ready-to-show', () => {
    if (app.isPackaged) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'programmingKyle',
        repo: 'screen-sentry',
      });
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
};

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Checking for Update');
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Available');
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'No Updates Available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Downloaded');
});

ipcMain.handle('restart-and-update', () => {
  ensureSafeQuitAndInstall();
});

function ensureSafeQuitAndInstall() {
  setImmediate(() => {
    app.removeAllListeners("window-all-closed")
    if (mainWindow != null) {
      mainWindow.close()
    }
    autoUpdater.quitAndInstall(false)
  })
}

ipcMain.handle('close-app', () => {
  app.quit();
});

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

ipcMain.handle('frame-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'Minimize':
      mainWindow.minimize();
      break;
    case 'Exit':
      mainWindow.close();
      break;
    }
});


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
      maximize: true,
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

    selectionWindow.setFullScreen(true);

    selectionWindows.push(selectionWindow);
  });
}

ipcMain.handle('get-config', async () => {
  const settings = store.get();
  const converted = Object.assign({}, settings);
  return converted;
});

// Used for either adding or making edits to the config
function alterConfigHandler(key, setting, value){
  const config = store.get();
  if (config){
    const keyData = store.get(key, {});
    keyData[setting] = value;
    config[key] = keyData;
    store.set(config);
  } else {
    store.set(key, { [setting]: value });
  }
}

ipcMain.handle('window-select-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'openSelection':
      detectionThreshold = data.threshold;
      alterConfigHandler('inputSettings', 'threshold', data.threshold);
      alterConfigHandler('inputSettings', 'volume', data.volume);
      createSelectionWindows();
      break;
    case 'select':
      windowSelection(data.selection);
      break;
    case 'close':
      mainWindow.webContents.send('monitoring-handler', 'Close');
      closeWindowSelection();
      break;
    case 'stop':
      stopMonitoring();
      break;
  }
});

let region;
let monitorInterval;

function windowSelection(selection){
  mainWindow.webContents.send('monitoring-handler', 'Monitoring');
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
  region = selection;

  const selectedDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  monitorScreen(region, selectedDisplay);
}

function closeWindowSelection(){
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
}

function captureScreenshot(region, display) {
  const { width, height } = display.size;

  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } })
      .then(sources => {
        const source = sources.find(s => s.display_id === display.id.toString());

        if (source) {
          const image = nativeImage.createFromBuffer(source.thumbnail.toPNG());
          const { x, y, width: cropWidth, height: cropHeight } = region;
          const croppedImage = image.crop({ x, y, width: cropWidth, height: cropHeight });

          const pngData = croppedImage.toPNG();
          resolve(pngData);
        } else {
          reject(new Error('Failed to find source for display: ' + display.id));
        }
      })
      .catch(error => {
        reject(new Error('Error getting screen sources: ' + error));
      });
  });
}

function compareImages(img1, img2) {
  const img1Image = nativeImage.createFromBuffer(img1);
  const img2Image = nativeImage.createFromBuffer(img2);

  const diff = new PNG({ width: img1Image.getSize().width, height: img1Image.getSize().height });
  const mismatchedPixels = pixelmatch(
    img1Image.toBitmap(), img2Image.toBitmap(), diff.data,
    img1Image.getSize().width, img1Image.getSize().height,
    { threshold: detectionThreshold }
  );

  return mismatchedPixels;
}

function monitorScreen(region, display) {
  let previousImg = null;

  monitorInterval = setInterval(() => {
    captureScreenshot(region, display)
      .then(currentImg => {
        if (previousImg) {
          const mismatchedPixels = compareImages(previousImg, currentImg);
          if (mismatchedPixels > 0) {
            mainWindow.webContents.send('monitoring-handler', 'Notify');
            console.log(`Change detected! ${mismatchedPixels} pixels changed.`);
          } else {
            console.log('No change detected.');
          }
        }
        previousImg = currentImg;
      })
      .catch(error => {
        console.error('Error capturing current screenshot:', error);
      });
  }, 2000);
}

function stopMonitoring(){
  if (monitorInterval){
    clearInterval(monitorInterval);
  }
}

ipcMain.handle('input-handler', (req, data) => {

});