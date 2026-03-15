import type { FileTreeActions } from "@greyboard/file-explorer";
import {
  FileTree,
  FileTreeProvider,
  FolderPicker,
} from "@greyboard/file-explorer";
import { FolderFillBadgePlusIcon } from "@feel-good/icons";
import { IconButton } from "@greyboard/ui/components/icon-button";
import { cn } from "@greyboard/ui/lib/utils";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../../store";

function ExplorerPanelHeader(
  { className, ...props }: React.ComponentProps<"div">,
) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex justify-between items-center px-3 pr-1.5 py-1 h-10",
        className,
      )}
      {...props}
    />
  );
}

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
    })),
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
    [
      setSelectedFile,
      openFile,
      toggleFolder,
      createFile,
      createFolder,
      renameItem,
      deleteItem,
      loadChildren,
    ],
  );

  return (
    <div className="flex h-full flex-col">
      <ExplorerPanelHeader>
        <span className="font-medium text-sm">
          Archive
        </span>

        <IconButton
          tooltip="Open Folder"
          onClick={openFolder}
          size="icon-sm"
        >
          <FolderFillBadgePlusIcon className="size-4.5" />
        </IconButton>
      </ExplorerPanelHeader>

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
