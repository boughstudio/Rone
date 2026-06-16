const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

app.setName('Rone')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    title: 'Rone',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  Menu.setApplicationMenu(null)
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
