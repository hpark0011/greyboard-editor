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
