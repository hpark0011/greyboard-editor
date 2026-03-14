import { useStore } from "../../store";
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
    openFile,
  } = useStore();

  const handleFileClick = async (path: string) => {
    setSelectedFile(path);
    await openFile(path);
  };

  const handleSetTree = (
    newTree: typeof tree | ((prev: typeof tree) => typeof tree),
  ) => {
    if (typeof newTree === "function") {
      useStore.setState((state) => ({ tree: newTree(state.tree) }));
    } else {
      useStore.setState({ tree: newTree });
    }
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
            onSetTree={handleSetTree}
          />
        )
        : <FolderPicker onOpenFolder={openFolder} />}
    </div>
  );
}
