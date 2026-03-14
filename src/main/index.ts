import { existsSync } from "fs";
import { app, BrowserWindow } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc-handlers";
import { createMenu } from "./menu";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function resolveDistAssetPath(...segments: string[]): string {
  const appPath = app.getAppPath();
  const candidateRoots = [
    appPath,
    path.resolve(appPath, ".."),
    path.resolve(appPath, "../.."),
  ];

  for (const root of candidateRoots) {
    const candidate = path.join(root, "dist", ...segments);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(appPath, "dist", ...segments);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      preload: resolveDistAssetPath("preload", "index.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(resolveDistAssetPath("renderer", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

export { mainWindow };
