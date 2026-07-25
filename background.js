// background.js

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

function startBackend() {
  const backendPath = path.join(
    process.resourcesPath,
    "backend",
    "start-backend.bat",
  );
  spawn("cmd.exe", ["/c", backendPath], { detached: true, stdio: "ignore" });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true, // permite usar require en renderer si lo necesitas
      contextIsolation: false, // desactiva aislamiento (para pruebas locales está bien)
    },
  });

  win.loadFile("dist/index.html"); // tu build de Vue. index.html que se genera en dist/index.html
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
