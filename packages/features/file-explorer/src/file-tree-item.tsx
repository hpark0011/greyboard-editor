import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { TreeNode } from "@greyboard/core/file-system";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@greyboard/ui/primitives/context-menu";
import { Input } from "@greyboard/ui/primitives/input";
import { cn } from "@greyboard/ui/lib/utils";

interface FileTreeItemProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onFileClick: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateFolder: (parentPath: string, name: string) => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string) => void;
  onLoadChildren: (path: string) => Promise<void>;
}

export function FileTreeItem({
  node,
  depth,
  selectedPath,
  onFileClick,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onLoadChildren,
}: FileTreeItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isCreating, setIsCreating] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");

  const isFolder = node.type === "folder";
  const isSelected = node.path === selectedPath;

  const handleClick = async () => {
    if (isFolder) {
      if (!node.expanded) {
        await onLoadChildren(node.path);
      }
      onToggleFolder(node.path);
    } else {
      onFileClick(node.path);
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.path, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleCreateSubmit = () => {
    if (newName.trim() && isCreating) {
      if (isCreating === "file") {
        onCreateFile(node.path, newName.trim());
      } else {
        onCreateFolder(node.path, newName.trim());
      }
    }
    setIsCreating(null);
    setNewName("");
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {isRenaming ? (
            <div
              className={cn(
                // Layout & alignment
                "flex items-center gap-1",
                // Sizing
                "w-full",
                // Shape
                "rounded-sm",
                // Spacing
                "px-1 py-0.5",
                // Typography
                "text-sm",
                isSelected && "bg-accent text-accent-foreground"
              )}
              style={{ paddingLeft: `${depth * 12 + 4}px` }}
            >
              {isFolder ? (
                <>
                  {node.expanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  {node.expanded ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                </>
              )}
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                  if (e.key === "Escape") setIsRenaming(false);
                }}
                className="h-5 text-xs px-1"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={handleClick}
              className={cn(
                // Layout & alignment
                "flex items-center gap-1 text-left",
                // Sizing
                "w-full",
                // Shape
                "rounded-sm",
                // Spacing
                "px-1 py-0.5",
                // Typography
                "text-sm",
                // Interactive states
                "hover:bg-accent transition-colors",
                isSelected && "bg-accent text-accent-foreground"
              )}
              style={{ paddingLeft: `${depth * 12 + 4}px` }}
            >
              {isFolder ? (
                <>
                  {node.expanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  {node.expanded ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                </>
              )}
              <span className="truncate">{node.name}</span>
            </button>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem
                onClick={() => {
                  setIsCreating("file");
                  if (!node.expanded) {
                    onToggleFolder(node.path);
                  }
                }}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setIsCreating("folder");
                  if (!node.expanded) {
                    onToggleFolder(node.path);
                  }
                }}
              >
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem
            onClick={() => {
              setRenameValue(node.name);
              setIsRenaming(true);
            }}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onDelete(node.path)}
            className="text-destructive"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {isFolder && node.expanded && (
        <>
          {isCreating && (
            <div
              className="flex items-center gap-1 px-1 py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 12 + 4}px` }}
            >
              <span className="w-3.5 shrink-0" />
              {isCreating === "folder" ? (
                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleCreateSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateSubmit();
                  if (e.key === "Escape") {
                    setIsCreating(null);
                    setNewName("");
                  }
                }}
                className="h-5 text-xs px-1"
                autoFocus
                placeholder={
                  isCreating === "file" ? "filename.md" : "folder name"
                }
              />
            </div>
          )}
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onFileClick={onFileClick}
              onToggleFolder={onToggleFolder}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
              onLoadChildren={onLoadChildren}
            />
          ))}
        </>
      )}
    </>
  );
}
