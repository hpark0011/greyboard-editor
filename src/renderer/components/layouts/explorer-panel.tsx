import { useMemo } from "react";
import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { FileTree, FileTreeProvider, FolderPicker } from "@greyboard/file-explorer";
import type { FileTreeActions } from "@greyboard/file-explorer";
import { FolderOpen } from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";

export function ExplorerPanel() {
  const {
    workspaceRoot,
    tree,
    selectedFilePath,
    openFolder,
    toggleFolder,
    setSelectedFile,
    openFile,
    createFile,
    createFolder,
    renameItem,
    deleteItem,
    loadChildren,
  } = useStore(
    useShallow((s) => ({
      workspaceRoot: s.workspaceRoot,
      tree: s.tree,
      selectedFilePath: s.selectedFilePath,
      openFolder: s.openFolder,
      toggleFolder: s.toggleFolder,
      setSelectedFile: s.setSelectedFile,
      openFile: s.openFile,
      createFile: s.createFile,
      createFolder: s.createFolder,
      renameItem: s.renameItem,
      deleteItem: s.deleteItem,
      loadChildren: s.loadChildren,
    }))
  );

  const actions: FileTreeActions = useMemo(
    () => ({
      onFileClick: (path: string) => {
        setSelectedFile(path);
        openFile(path);
      },
      onToggleFolder: toggleFolder,
      onCreateFile: createFile,
      onCreateFolder: createFolder,
      onRename: renameItem,
      onDelete: deleteItem,
      onLoadChildren: loadChildren,
    }),
    [setSelectedFile, openFile, toggleFolder, createFile, createFolder, renameItem, deleteItem, loadChildren]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Explorer
        </span>
        <IconButton
          tooltip="Open Folder"
          onClick={openFolder}
          size="icon-xs"
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      {workspaceRoot
        ? (
          <FileTreeProvider value={actions}>
            <FileTree
              tree={tree}
              selectedPath={selectedFilePath}
            />
          </FileTreeProvider>
        )
        : <FolderPicker onOpenFolder={openFolder} />}
    </div>
  );
}
