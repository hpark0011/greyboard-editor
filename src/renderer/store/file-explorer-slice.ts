import type { StateCreator } from "zustand";
import type { TreeNode } from "@greyboard/core/file-system";

export interface FileExplorerSlice {
  workspaceRoot: string | null;
  tree: TreeNode[];
  selectedFilePath: string | null;
  openFolder: () => Promise<void>;
  refreshTree: () => Promise<void>;
  setSelectedFile: (path: string | null) => void;
  toggleFolder: (path: string) => void;
}

function toggleFolderInTree(nodes: TreeNode[], folderPath: string): TreeNode[] {
  return nodes.map((node) => {
    if (node.type === "folder" && node.path === folderPath) {
      return { ...node, expanded: !node.expanded };
    }
    if (node.type === "folder") {
      return { ...node, children: toggleFolderInTree(node.children, folderPath) };
    }
    return node;
  });
}

function mergeExpandedState(newTree: TreeNode[], oldTree: TreeNode[]): TreeNode[] {
  const oldMap = new Map<string, TreeNode>();
  for (const node of oldTree) oldMap.set(node.path, node);

  return newTree.map((node) => {
    const old = oldMap.get(node.path);
    if (node.type === "folder" && old?.type === "folder") {
      return {
        ...node,
        expanded: old.expanded,
        children: mergeExpandedState(node.children, old.children),
      };
    }
    return node;
  });
}

async function buildTree(dirPath: string): Promise<TreeNode[]> {
  const entries = await window.greyboard.readDir(dirPath);
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory) {
      nodes.push({
        type: "folder",
        name: entry.name,
        path: entry.path,
        children: [],
        expanded: false,
      });
    } else {
      const ext = entry.name.includes(".")
        ? "." + entry.name.split(".").pop()!
        : "";
      nodes.push({
        type: "file",
        name: entry.name,
        path: entry.path,
        extension: ext,
      });
    }
  }

  return nodes;
}

export const createFileExplorerSlice: StateCreator<FileExplorerSlice> = (
  set,
  get
) => ({
  workspaceRoot: null,
  tree: [],
  selectedFilePath: null,

  openFolder: async () => {
    const folderPath = await window.greyboard.selectFolder();
    if (!folderPath) return;
    set({ workspaceRoot: folderPath });
    const tree = await buildTree(folderPath);
    set({ tree });
    window.greyboard.watchFolder(folderPath);
    window.greyboard.onFileChange(() => {
      get().refreshTree();
    });
  },

  refreshTree: async () => {
    const root = get().workspaceRoot;
    if (!root) return;
    const oldTree = get().tree;
    const newTree = await buildTree(root);
    set({ tree: mergeExpandedState(newTree, oldTree) });
  },

  setSelectedFile: (path) => set({ selectedFilePath: path }),

  toggleFolder: (path) =>
    set((state) => ({ tree: toggleFolderInTree(state.tree, path) })),
});
