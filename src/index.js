const { app, BrowserWindow, ipcMain, screen, desktopCapturer, nativeImage } = require('electron');
const path = require('node:path');
const appDataPath = app.getPath('userData');

const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

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

let region;

function windowSelection(selection){
  console.log(selection);
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
  region = selection;

  const selectedDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  captureScreenshot(region, selectedDisplay);
  //monitorScreen(region);
}

function closeWindowSelection(){
  selectionWindows.forEach(element => {
    element.close();
  });
  selectionWindows.length = 0;
}

function captureScreenshot(region, display) {
  const { width, height } = display.size;

  desktopCapturer.getSources({ types: ['screen'], thumbnailSize: {width, height} })
        .then(sources => {
          const source = sources.find(s => s.display_id === display.id.toString());

          if (source) {
              console.log('Capturing screenshot of display:', display.id);
              const pngData = source.thumbnail.toPNG();
              const filePath = path.join(appDataPath, 'screenshot.png');
              fs.writeFile(filePath, pngData, err => {
                  if (err) {
                      console.error('Failed to save screenshot:', err);
                  } else {
                      console.log('Screenshot saved successfully:', filePath);
                  }
              });
          } else {
              console.error('Failed to find source for display:', display.id);
          }
      })
      .catch(error => {
          console.error('Error getting screen sources:', error);
      });
}

function compareImages(img1, img2) {
  const diff = new PNG({ width: img1.width, height: img1.height });

  const mismatchedPixels = pixelmatch(
    img1.data, img2.data, diff.data,
    img1.width, img1.height,
    { threshold: 0.1 }
  );

  return mismatchedPixels;
}

function monitorScreen(region) {
  const interval = setInterval(() => {
    captureScreenshot(region)
      .then(previousImg => {
        setTimeout(() => {
          captureScreenshot(region)
            .then(currentImg => {
              const mismatchedPixels = compareImages(previousImg, currentImg);

              if (mismatchedPixels > 0) {
                console.log(`Change detected! ${mismatchedPixels} pixels changed.`);
              } else {
                console.log('No change detected.');
              }
            })
            .catch(error => {
              console.error('Error capturing current screenshot:', error);
            });
        }, 1000);
      })
      .catch(error => {
        console.error('Error capturing previous screenshot:', error);
      });
  }, 5000);

  setTimeout(() => {
    clearInterval(interval);
    console.log('Monitoring stopped.');
  }, 600000);
}