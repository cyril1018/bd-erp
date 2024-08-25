// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.disableWebInstaller = true

let mainWindow;

// 监听渲染进程发送的查询请求
const customers = require('./models/customers')
ipcMain.handle('customers:get-all', (event) => customers.getAll());
ipcMain.handle('customers:save', (event, data) => customers.save(data));
ipcMain.handle('customers:delete', (event, id) => customers.delete(id));

const sells = require('./models/sells')
ipcMain.handle('sells:get', (event, qry) => sells.get(qry));
ipcMain.handle('sells:getById', (event, id) => sells.getById(id));
ipcMain.handle('sells:add', (event, data) => sells.add(data));
ipcMain.handle('sells:update', (event, data) => sells.update(data));
ipcMain.handle('sells:delete', (event, id) => sells.delete(id));

const items = require('./models/items')
ipcMain.handle('items:get', (event, qry) => items.get(qry));
ipcMain.handle('items:save', (event, data) => items.save(data));
ipcMain.handle('items:delete', (event, id) => items.delete(id));

ipcMain.handle('test:getPath', (event) => app.getPath("userData"));

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  // { role: 'viewMenu' }
  {
    label: '檢視',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom', label:'還原原始縮放' },
      { role: 'zoomIn', label:'放大' },
      { role: 'zoomOut', label:'縮小'},
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.resolve(app.getPath("userData"), 'icon.png')
  })

  // and load the index.html of the app.
  mainWindow.loadFile('sells.html')

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

