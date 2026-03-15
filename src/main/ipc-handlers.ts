import { ipcMain, dialog, BrowserWindow } from "electron";
import { IpcChannel } from "@greyboard/core/ipc";
import type { AppConfig } from "@greyboard/core/config";
import { loadConfig, saveConfig } from "@greyboard/shared/config";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { app } from "electron";

let workspaceRoot: string | null = null;
let activeWatchAbort: AbortController | null = null;

const CONFIG_FILE_NAME = "config.json";

function validatePath(filePath: string): string {
  if (!workspaceRoot) throw new Error("No workspace open");
  const resolved = path.resolve(filePath);
  const relative = path.relative(workspaceRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path outside workspace");
  }
  return resolved;
}

function getConfigPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE_NAME);
}

async function readAppConfig(): Promise<AppConfig> {
  return loadConfig(getConfigPath());
}

async function writeAppConfig(config: AppConfig): Promise<AppConfig> {
  await saveConfig(getConfigPath(), config);
  return config;
}

function mergeConfigPatch(
  config: AppConfig,
  patch: Partial<AppConfig>
): AppConfig {
  return {
    ...config,
    ...patch,
    panelSizes: { ...config.panelSizes, ...patch.panelSizes },
  };
}

async function resolveWorkspaceRoot(
  rootPath: string
): Promise<string | null> {
  try {
    const resolved = path.resolve(rootPath);
    const stat = await fs.stat(resolved);
    if (!stat.isDirectory()) {
      return null;
    }
    workspaceRoot = resolved;
    return resolved;
  } catch {
    return null;
  }
}

export function registerIpcHandlers() {
  ipcMain.handle(IpcChannel.SelectFolder, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return resolveWorkspaceRoot(result.filePaths[0]);
  });

  ipcMain.handle(
    IpcChannel.RestoreWorkspace,
    async (_event, rootPath: string) => resolveWorkspaceRoot(rootPath)
  );

  ipcMain.handle(IpcChannel.LoadConfig, async () => readAppConfig());

  ipcMain.handle(
    IpcChannel.UpdateConfig,
    async (_event, patch: Partial<AppConfig>) => {
      const currentConfig = await readAppConfig();
      return writeAppConfig(mergeConfigPatch(currentConfig, patch));
    }
  );

  ipcMain.handle(IpcChannel.ReadDir, async (_event, dirPath: string) => {
    const resolved = validatePath(dirPath);
    const entries = await fs.readdir(resolved, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith("."))
      .map((e) => ({
        name: e.name,
        path: path.join(resolved, e.name),
        isDirectory: e.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  });

  ipcMain.handle(IpcChannel.ReadFile, async (_event, filePath: string) => {
    const resolved = validatePath(filePath);
    return fs.readFile(resolved, "utf-8");
  });

  ipcMain.handle(
    IpcChannel.WriteFile,
    async (_event, filePath: string, content: string) => {
      const resolved = validatePath(filePath);
      const tmpPath = path.join(
        path.dirname(resolved),
        `.${path.basename(resolved)}.${randomUUID()}.tmp`
      );
      await fs.writeFile(tmpPath, content, "utf-8");
      await fs.rename(tmpPath, resolved);
    }
  );

  ipcMain.handle(IpcChannel.DeleteFile, async (_event, filePath: string) => {
    const resolved = validatePath(filePath);
    await fs.rm(resolved, { recursive: true });
  });

  ipcMain.handle(
    IpcChannel.CreateFile,
    async (_event, filePath: string, content: string = "") => {
      const resolved = validatePath(filePath);
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, content, "utf-8");
    }
  );

  ipcMain.handle(
    IpcChannel.CreateFolder,
    async (_event, folderPath: string) => {
      const resolved = validatePath(folderPath);
      await fs.mkdir(resolved, { recursive: true });
    }
  );

  ipcMain.handle(
    IpcChannel.RenameFile,
    async (_event, oldPath: string, newPath: string) => {
      const resolvedOld = validatePath(oldPath);
      const resolvedNew = validatePath(newPath);
      await fs.rename(resolvedOld, resolvedNew);
    }
  );

  ipcMain.handle(
    IpcChannel.WatchFolder,
    async (_event, folderPath: string) => {
      const resolved = validatePath(folderPath);
      if (activeWatchAbort) {
        activeWatchAbort.abort();
      }
      activeWatchAbort = new AbortController();
      const watcher = fs.watch(resolved, { recursive: true, signal: activeWatchAbort.signal });
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      (async () => {
        try {
          for await (const _event of watcher) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              const win = BrowserWindow.getAllWindows()[0];
              if (win) {
                win.webContents.send(IpcChannel.FileChanged);
              }
            }, 100);
          }
        } catch {
          // Watcher closed
        }
      })();

      return true;
    }
  );
}
