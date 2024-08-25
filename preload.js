/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  restartApp: () => ipcRenderer.send('restart_app')
});
contextBridge.exposeInMainWorld('api', {
  customers: {
    getAll: () => ipcRenderer.invoke("customers:get-all"),
    getByKeyword: () => ipcRenderer.invoke("customers:get-all"),
    save: (data) => ipcRenderer.invoke('customers:save', data),
    delete:(id) =>ipcRenderer.invoke('customers:delete', id)
  },
  sells: {
    get: (qry) => ipcRenderer.invoke("sells:get", qry),
    getById: (id) => ipcRenderer.invoke("sells:getById", id),
    add: (data) => ipcRenderer.invoke('sells:add', data),
    update: (data) => ipcRenderer.invoke('sells:update', data),
    delete: (id) => ipcRenderer.invoke('sells:delete', id),
  },
  items: {
    get: () => ipcRenderer.invoke("items:get"),
    save: (data) => ipcRenderer.invoke('items:save', data),
    delete:(id) =>ipcRenderer.invoke('items:delete', id)
  },
  test: {
    getPath: () => ipcRenderer.invoke("test:getPath")
  }
})