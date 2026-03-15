import { createContext, useContext } from "react";

export interface FileTreeActions {
  onFileClick: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string) => void;
  onLoadChildren: (path: string) => Promise<void>;
}

const FileTreeContext = createContext<FileTreeActions | null>(null);

export const FileTreeProvider = FileTreeContext.Provider;

export function useFileTreeActions(): FileTreeActions {
  const ctx = useContext(FileTreeContext);
  if (!ctx) {
    throw new Error("useFileTreeActions must be used within a FileTreeProvider");
  }
  return ctx;
}
