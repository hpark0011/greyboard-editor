import { useState } from "react";
import { File, Folder } from "lucide-react";
import type { TreeNode } from "@greyboard/core/file-system";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@greyboard/ui/primitives/context-menu";
import { Input } from "@greyboard/ui/primitives/input";
import { cn } from "@greyboard/ui/lib/utils";
import { useFileTreeActions } from "./file-tree-context";
import { FileTreeIcons } from "./file-tree-icons";

function RenameInput({
  value,
  onCommit,
  onCancel,
}: {
  value: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = () => {
    onCommit(inputValue);
  };

  return (
    <Input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSubmit();
        if (e.key === "Escape") onCancel();
      }}
      className="h-5 text-xs px-1"
      autoFocus
    />
  );
}

function CreateInput({
  type,
  onCommit,
  onCancel,
}: {
  type: "file" | "folder";
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    onCommit(inputValue);
  };

  return (
    <>
      <span className="w-3.5 shrink-0" />
      {type === "folder"
        ? <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        : <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        className="h-5 text-xs px-1"
        autoFocus
        placeholder={type === "file" ? "filename.md" : "folder name"}
      />
    </>
  );
}

interface FileTreeItemProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
}

export function FileTreeItem({
  node,
  depth,
  selectedPath,
}: FileTreeItemProps) {
  const {
    onFileClick,
    onToggleFolder,
    onCreateFile,
    onCreateFolder,
    onRename,
    onDelete,
    onLoadChildren,
  } = useFileTreeActions();

  const [mode, setMode] = useState<
    "idle" | "renaming" | "creating-file" | "creating-folder"
  >("idle");

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

  const handleRenameCommit = (value: string) => {
    if (value.trim() && value !== node.name) {
      onRename(node.path, value.trim());
    }
    setMode("idle");
  };

  const handleCreateCommit = (name: string) => {
    if (name.trim()) {
      if (mode === "creating-file") {
        onCreateFile(node.path, name.trim());
      } else if (mode === "creating-folder") {
        onCreateFolder(node.path, name.trim());
      }
    }
    setMode("idle");
  };

  const isExpanded = isFolder && "expanded" in node && !!node.expanded;

  const triggerContent = mode === "renaming"
    ? (
      <div
        className={cn(
          "flex items-center gap-1",
          "w-full",
          "px-1 py-0.5",
          "text-[13px]",
          isSelected && "bg-accent-dark text-accent-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <FileTreeIcons isFolder={isFolder} expanded={isExpanded} />
        <RenameInput
          value={node.name}
          onCommit={handleRenameCommit}
          onCancel={() => setMode("idle")}
        />
      </div>
    )
    : (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 text-left",
          "w-full",
          "px-1 py-0.5",
          "text-[13px]",
          "hover:bg-accent-dark dark:hover:bg-accent",
          isSelected && "bg-accent-dark text-accent-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
      >
        <FileTreeIcons isFolder={isFolder} expanded={isExpanded} />
        <span className="truncate">{node.name}</span>
      </button>
    );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {triggerContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isFolder && (
            <>
              <ContextMenuItem
                onClick={() => {
                  setMode("creating-file");
                  if (!node.expanded) {
                    onToggleFolder(node.path);
                  }
                }}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  setMode("creating-folder");
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
              setMode("renaming");
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
          {(mode === "creating-file" || mode === "creating-folder") && (
            <div
              className="flex items-center gap-1 px-1 py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 12 + 4}px` }}
            >
              <CreateInput
                type={mode === "creating-file" ? "file" : "folder"}
                onCommit={handleCreateCommit}
                onCancel={() => setMode("idle")}
              />
            </div>
          )}
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
            />
          ))}
        </>
      )}
    </>
  );
}
