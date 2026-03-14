import { useStore } from "../../store";
import { useShallow } from "zustand/react/shallow";
import { FileTree, FolderPicker } from "@greyboard/file-explorer";
import { FolderOpen } from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";

export function ExplorerPanel() {
  const {
    workspaceRoot,
    tree,
    selectedFilePath,
    openFolder,
    refreshTree,
    toggleFolder,
    setSelectedFile,
    setTree,
    openFile,
  } = useStore(
    useShallow((s) => ({
      workspaceRoot: s.workspaceRoot,
      tree: s.tree,
      selectedFilePath: s.selectedFilePath,
      openFolder: s.openFolder,
      refreshTree: s.refreshTree,
      toggleFolder: s.toggleFolder,
      setSelectedFile: s.setSelectedFile,
      setTree: s.setTree,
      openFile: s.openFile,
    }))
  );

  const handleFileClick = async (path: string) => {
    setSelectedFile(path);
    await openFile(path);
  };

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
          <FileTree
            tree={tree}
            selectedPath={selectedFilePath}
            workspaceRoot={workspaceRoot}
            onFileClick={handleFileClick}
            onToggleFolder={toggleFolder}
            onRefreshTree={refreshTree}
            onSetTree={setTree}
          />
        )
        : <FolderPicker onOpenFolder={openFolder} />}
    </div>
  );
}
