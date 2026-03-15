import type { TreeNode } from "@greyboard/core/file-system";
import { ScrollArea } from "@greyboard/ui/primitives/scroll-area";
import { FileTreeItem } from "./file-tree-item";

interface FileTreeProps {
  tree: TreeNode[];
  selectedPath: string | null;
}

export function FileTree({ tree, selectedPath }: FileTreeProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-0">
        {tree.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
