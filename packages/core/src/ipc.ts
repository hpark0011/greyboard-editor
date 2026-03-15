import type { AppConfig } from "./config";

export enum IpcChannel {
  SelectFolder = "greyboard:select-folder",
  RestoreWorkspace = "greyboard:restore-workspace",
  GetInitialTheme = "greyboard:get-initial-theme",
  ReadDir = "greyboard:read-dir",
  ReadFile = "greyboard:read-file",
  WriteFile = "greyboard:write-file",
  DeleteFile = "greyboard:delete-file",
  CreateFile = "greyboard:create-file",
  CreateFolder = "greyboard:create-folder",
  RenameFile = "greyboard:rename-file",
  WatchFolder = "greyboard:watch-folder",
  FileChanged = "greyboard:file-changed",
  LoadConfig = "greyboard:load-config",
  UpdateConfig = "greyboard:update-config",
}

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface GreyboardApi {
  platform: NodeJS.Platform;
  initialTheme: AppConfig["theme"];
  selectFolder: () => Promise<string | null>;
  restoreWorkspace: (rootPath: string) => Promise<string | null>;
  readDir: (dirPath: string) => Promise<DirectoryEntry[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  createFolder: (folderPath: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  watchFolder: (folderPath: string) => Promise<boolean>;
  onFileChange: (callback: () => void) => () => void;
  loadConfig: () => Promise<AppConfig>;
  updateConfig: (patch: Partial<AppConfig>) => Promise<AppConfig>;
}
