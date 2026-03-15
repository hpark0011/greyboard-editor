import type { TreeNode } from "@greyboard/core/file-system";

function isSamePathOrDescendant(path: string, parentPath: string): boolean {
  return path === parentPath ||
    path.startsWith(`${parentPath}/`) ||
    path.startsWith(`${parentPath}\\`);
}

function shouldExpandFolder(
  folderPath: string,
  expandedFolderPaths: Set<string>
): boolean {
  for (const expandedPath of expandedFolderPaths) {
    if (isSamePathOrDescendant(expandedPath, folderPath)) {
      return true;
    }
  }

  return false;
}

export async function buildWorkspaceTree(
  dirPath: string,
  expandedFolderPaths: string[] = []
): Promise<TreeNode[]> {
  return buildWorkspaceTreeRecursive(dirPath, new Set(expandedFolderPaths));
}

async function buildWorkspaceTreeRecursive(
  dirPath: string,
  expandedFolderPaths: Set<string>
): Promise<TreeNode[]> {
  const entries = await window.greyboard.readDir(dirPath);

  return Promise.all(entries.map(async (entry) => {
    if (entry.isDirectory) {
      const expanded = shouldExpandFolder(entry.path, expandedFolderPaths);
      return {
        type: "folder" as const,
        name: entry.name,
        path: entry.path,
        children: expanded
          ? await buildWorkspaceTreeRecursive(entry.path, expandedFolderPaths)
          : [],
        expanded,
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
  }));
}

export function collectExpandedFolderPaths(tree: TreeNode[]): string[] {
  const expandedPaths: string[] = [];

  const visit = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.type !== "folder") {
        continue;
      }

      if (node.expanded) {
        expandedPaths.push(node.path);
      }

      visit(node.children);
    }
  };

  visit(tree);

  return expandedPaths;
}

export function treeContainsPath(
  tree: TreeNode[],
  targetPath: string
): boolean {
  for (const node of tree) {
    if (node.path === targetPath) {
      return true;
    }

    if (node.type === "folder" && treeContainsPath(node.children, targetPath)) {
      return true;
    }
  }

  return false;
}
