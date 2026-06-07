// Electron main process. Kept as plain CommonJS so it needs no build step;
// it just loads the Vite-built renderer (which renders the shared UI).
const { app, BrowserWindow } = require("electron");
const path = require("node:path");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 720,
    title: "Turbo Showcase (Electron)",
    webPreferences: { contextIsolation: true },
  });
  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
