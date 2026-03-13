import type { TreeNode, FolderNode } from "@greyboard/core/file-system";
import { ScrollArea } from "@greyboard/ui/primitives/scroll-area";
import { FileTreeItem } from "./file-tree-item";
import path from "path";

interface FileTreeProps {
  tree: TreeNode[];
  selectedPath: string | null;
  workspaceRoot: string;
  onFileClick: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onRefreshTree: () => void;
  onSetTree: (tree: TreeNode[] | ((prev: TreeNode[]) => TreeNode[])) => void;
}

export function FileTree({
  tree,
  selectedPath,
  workspaceRoot,
  onFileClick,
  onToggleFolder,
  onRefreshTree,
  onSetTree,
}: FileTreeProps) {
  const handleCreateFile = async (parentPath: string, name: string) => {
    const filePath = parentPath + "/" + name;
    await window.greyboard.createFile(filePath, "");
    onRefreshTree();
  };

  const handleCreateFolder = async (parentPath: string, name: string) => {
    const folderPath = parentPath + "/" + name;
    await window.greyboard.createFolder(folderPath);
    onRefreshTree();
  };

  const handleRename = async (oldPath: string, newName: string) => {
    const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
    const newPath = dir + "/" + newName;
    await window.greyboard.renameFile(oldPath, newPath);
    onRefreshTree();
  };

  const handleDelete = async (filePath: string) => {
    await window.greyboard.deleteFile(filePath);
    onRefreshTree();
  };

  const handleLoadChildren = async (folderPath: string) => {
    const entries = await window.greyboard.readDir(folderPath);
    const children: TreeNode[] = entries.map((entry) => {
      if (entry.isDirectory) {
        return {
          type: "folder" as const,
          name: entry.name,
          path: entry.path,
          children: [],
          expanded: false,
        };
      }
      const ext = entry.name.includes(".")
        ? "." + entry.name.split(".").pop()!
        : "";
      return {
        type: "file" as const,
        name: entry.name,
        path: entry.path,
        extension: ext,
      };
    });

    const updateChildren = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.type === "folder" && node.path === folderPath) {
          return { ...node, children };
        }
        if (node.type === "folder") {
          return { ...node, children: updateChildren(node.children) };
        }
        return node;
      });

    onSetTree((prevTree) => updateChildren(prevTree));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-1">
        {tree.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onFileClick={onFileClick}
            onToggleFolder={onToggleFolder}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onRename={handleRename}
            onDelete={handleDelete}
            onLoadChildren={handleLoadChildren}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
