export enum IpcChannel {
  SelectFolder = "greyboard:select-folder",
  ReadDir = "greyboard:read-dir",
  ReadFile = "greyboard:read-file",
  WriteFile = "greyboard:write-file",
  DeleteFile = "greyboard:delete-file",
  CreateFile = "greyboard:create-file",
  CreateFolder = "greyboard:create-folder",
  RenameFile = "greyboard:rename-file",
  WatchFolder = "greyboard:watch-folder",
  FileChanged = "greyboard:file-changed",
}

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface GreyboardApi {
  platform: NodeJS.Platform;
  selectFolder: () => Promise<string | null>;
  readDir: (dirPath: string) => Promise<DirectoryEntry[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  createFolder: (folderPath: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  watchFolder: (folderPath: string) => Promise<boolean>;
  onFileChange: (callback: () => void) => () => void;
}
