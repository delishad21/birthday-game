const { app, BrowserWindow, protocol } = require('electron');
const path = require('node:path');
const { createAppProtocolResponse } = require('./appProtocol.cjs');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const distPath = path.join(__dirname, '..', 'dist');

const registerAppProtocol = () => {
  protocol.handle('app', (request) => createAppProtocolResponse(request, distPath));
};

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: '#17112a',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadURL('app://birthday/index.html');
};

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
