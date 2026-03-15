import type { StateCreator } from "zustand";
import type { TreeNode } from "@greyboard/core/file-system";

export interface FileExplorerSlice {
  workspaceRoot: string | null;
  tree: TreeNode[];
  selectedFilePath: string | null;
  error: string | null;
  openFolder: () => Promise<void>;
  refreshTree: () => Promise<void>;
  setSelectedFile: (path: string | null) => void;
  setTree: (updater: TreeNode[] | ((prev: TreeNode[]) => TreeNode[])) => void;
  toggleFolder: (path: string) => void;
  setError: (error: string | null) => void;
  createFile: (parentPath: string, name: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  loadChildren: (folderPath: string) => Promise<void>;
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

let unwatchFileChange: (() => void) | null = null;

export const createFileExplorerSlice: StateCreator<FileExplorerSlice> = (
  set,
  get
) => ({
  workspaceRoot: null,
  tree: [],
  selectedFilePath: null,
  error: null,

  openFolder: async () => {
    try {
      const folderPath = await window.greyboard.selectFolder();
      if (!folderPath) return;
      set({ workspaceRoot: folderPath, error: null });
      const tree = await buildTree(folderPath);
      set({ tree });
      window.greyboard.watchFolder(folderPath);
      if (unwatchFileChange) unwatchFileChange();
      unwatchFileChange = window.greyboard.onFileChange(() => {
        get().refreshTree();
      });
    } catch (e) {
      set({ error: `Failed to open folder: ${(e as Error).message}` });
    }
  },

  refreshTree: async () => {
    try {
      const root = get().workspaceRoot;
      if (!root) return;
      const oldTree = get().tree;
      const newTree = await buildTree(root);
      set({ tree: mergeExpandedState(newTree, oldTree) });
    } catch (e) {
      set({ error: `Failed to refresh tree: ${(e as Error).message}` });
    }
  },

  setSelectedFile: (path) => set({ selectedFilePath: path }),

  setTree: (updater) =>
    set((state) => ({
      tree: typeof updater === "function" ? updater(state.tree) : updater,
    })),

  toggleFolder: (path) =>
    set((state) => ({ tree: toggleFolderInTree(state.tree, path) })),

  setError: (error) => set({ error }),

  createFile: async (parentPath, name) => {
    try {
      const filePath = parentPath + "/" + name;
      await window.greyboard.createFile(filePath, "");
      await get().refreshTree();
    } catch (e) {
      set({ error: `Failed to create file: ${(e as Error).message}` });
    }
  },

  createFolder: async (parentPath, name) => {
    try {
      const folderPath = parentPath + "/" + name;
      await window.greyboard.createFolder(folderPath);
      await get().refreshTree();
    } catch (e) {
      set({ error: `Failed to create folder: ${(e as Error).message}` });
    }
  },

  renameItem: async (oldPath, newName) => {
    try {
      const dir = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = dir + "/" + newName;
      await window.greyboard.renameFile(oldPath, newPath);
      await get().refreshTree();
    } catch (e) {
      set({ error: `Failed to rename: ${(e as Error).message}` });
    }
  },

  deleteItem: async (path) => {
    try {
      await window.greyboard.deleteFile(path);
      await get().refreshTree();
    } catch (e) {
      set({ error: `Failed to delete: ${(e as Error).message}` });
    }
  },

  loadChildren: async (folderPath) => {
    try {
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

      set((state) => ({ tree: updateChildren(state.tree) }));
    } catch (e) {
      set({ error: `Failed to load children: ${(e as Error).message}` });
    }
  },
});
