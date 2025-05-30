const electron = require('electron');
const fs = require('fs');
const Store = require('electron-store');
// setup server port in order to avoid port conflict
process.env.SERVER_PORT = 3080;
// launch server
require('./dist/src/app');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Initialize store for window settings
const store = new Store();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Get saved window size or use default
  const windowState = store.get('windowState', {
    width: 1200,
    height: 800
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...windowState,
    webPreferences: {
      // devTools: true,
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // Save window size when resized
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store.set('windowState', { width, height });
  });

  // Save window position when moved
  mainWindow.on('move', () => {
    const { x, y } = mainWindow.getBounds();
    store.set('windowState', { ...store.get('windowState'), x, y });
  });

  // replace IS_ELECTRON  to yes, beacause axios relative url
  const envConfig = path.join(__dirname, './build/env-config.js');
  fs.readFile(envConfig, 'utf8', function (err, files) {
    const result = files.replace(/{{IS_ELECTRON}}/g, 'yes');
    fs.writeFile(envConfig, result, 'utf8', function (err) {
      if (err) {
        console.log(err);
      }
    });
  });

  // get system lang
  mainWindow.webContents.executeJavaScript(`
   localStorage.setItem('lang', '${app.getLocale()}');
  `);
  // mainWindow.maximize();
  // mainWindow.show();
  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  mainWindow.loadURL(startUrl);
  // mainWindow.loadURL('http://127.0.0.1:3000');
  mainWindow.focus();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
