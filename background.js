// background.js

const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,       // permite usar require en renderer si lo necesitas
      contextIsolation: false      // desactiva aislamiento (para pruebas locales está bien)
    }
  })

  // 🔹 Cargar tu app de Vue
  // En desarrollo apunta al servidor de Vite/Vue (npm run serve)
  // En producción usarías loadFile(dist/index.html)
  // if (process.env.ELECTRON_DEV) {
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.VUE_APP_FRONT_END_PORT) // o 8080 según el puerto de tu Vue
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html')) // tu build de Vue. index.html que se genera en dist/index.html
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
