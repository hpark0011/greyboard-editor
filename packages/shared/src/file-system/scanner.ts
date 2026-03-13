import fs from "fs/promises";
import path from "path";
import type { TreeNode, FileNode, FolderNode } from "@greyboard/core/file-system";

export async function scanDirectory(dirPath: string): Promise<TreeNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  const sorted = entries
    .filter((e) => !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory())
        return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath);
      const folder: FolderNode = {
        type: "folder",
        name: entry.name,
        path: fullPath,
        children,
        expanded: false,
      };
      nodes.push(folder);
    } else {
      const file: FileNode = {
        type: "file",
        name: entry.name,
        path: fullPath,
        extension: path.extname(entry.name),
      };
      nodes.push(file);
    }
  }

  return nodes;
}
