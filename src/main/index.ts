import { existsSync } from "fs";
import { app, BrowserWindow } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc-handlers";
import { createMenu } from "./menu";

let mainWindow: BrowserWindow | null = null;

const userDataPathArg = process.argv.find((arg) =>
  arg.startsWith("--user-data-dir=")
);
if (userDataPathArg) {
  app.setPath("userData", userDataPathArg.slice("--user-data-dir=".length));
}

const isDev = !app.isPackaged && process.env.ELECTRON_IS_E2E !== "1";

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
    trafficLightPosition: { x: 9, y: 9 },
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
