import { ipcRenderer } from "electron";
import {
  IpcChannel,
  type DirectoryEntry,
  type GreyboardApi,
} from "@greyboard/core/ipc";

export const api = {
  platform: process.platform,
  initialTheme: ipcRenderer.sendSync(IpcChannel.GetInitialTheme),

  selectFolder: (): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.SelectFolder),

  restoreWorkspace: (rootPath: string): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannel.RestoreWorkspace, rootPath),

  readDir: (dirPath: string): Promise<DirectoryEntry[]> =>
    ipcRenderer.invoke(IpcChannel.ReadDir, dirPath),

  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IpcChannel.ReadFile, filePath),

  writeFile: (filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.WriteFile, filePath, content),

  deleteFile: (filePath: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.DeleteFile, filePath),

  createFile: (filePath: string, content?: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.CreateFile, filePath, content),

  createFolder: (folderPath: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.CreateFolder, folderPath),

  renameFile: (oldPath: string, newPath: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannel.RenameFile, oldPath, newPath),

  watchFolder: (folderPath: string): Promise<boolean> =>
    ipcRenderer.invoke(IpcChannel.WatchFolder, folderPath),

  onFileChange: (callback: () => void): (() => void) => {
    const handler = () => callback();
    ipcRenderer.on(IpcChannel.FileChanged, handler);
    return () => ipcRenderer.removeListener(IpcChannel.FileChanged, handler);
  },

  loadConfig: () => ipcRenderer.invoke(IpcChannel.LoadConfig),

  updateConfig: (patch) => ipcRenderer.invoke(IpcChannel.UpdateConfig, patch),

  updateConfigSync: (patch) => ipcRenderer.sendSync(IpcChannel.UpdateConfigSync, patch),
} satisfies GreyboardApi;
