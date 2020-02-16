import isDev from 'electron-is-dev';
import { app, BrowserWindow, ipcMain } from 'electron';
// const windowStateKeeper = require('electron-window-state');
import windowStateKeeper from 'electron-window-state';

import menu from './menu';
import { checkNewVersion } from './updateChecker';

app.name = 'LosslessCut';

// Not sure what the original author was trying to do here
// if (!isDev) process.env.NODE_ENV = 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Remember size and position
  const mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600,
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);

  mainWindow.loadFile(isDev ? 'index.html' : 'build/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('initial-render');
  });

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow();
  menu(app, mainWindow);

  const newVersion = await checkNewVersion();
  if (newVersion) {
    menu(app, mainWindow, newVersion);
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('renderer-ready', () => {
  if (!isDev) {
    const fileToOpen = process.argv[1];
    if (fileToOpen) mainWindow.webContents.send('file-opened', [fileToOpen]);
  }
});
