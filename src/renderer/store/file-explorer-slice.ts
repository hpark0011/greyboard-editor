import type { StateCreator } from "zustand";
import type { TreeNode } from "@greyboard/core/file-system";
import {
  buildWorkspaceTree,
  collectExpandedFolderPaths,
} from "./workspace-tree";

export interface FileExplorerSlice {
  workspaceRoot: string | null;
  tree: TreeNode[];
  selectedFilePath: string | null;
  error: string | null;
  initializeWorkspace: (
    rootPath: string,
    expandedFolderPaths?: string[]
  ) => Promise<boolean>;
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

let unwatchFileChange: (() => void) | null = null;

export const createFileExplorerSlice: StateCreator<FileExplorerSlice> = (
  set,
  get
) => ({
  workspaceRoot: null,
  tree: [],
  selectedFilePath: null,
  error: null,

  initializeWorkspace: async (rootPath: string, expandedFolderPaths = []) => {
    try {
      const tree = await buildWorkspaceTree(rootPath, expandedFolderPaths);
      set({
        workspaceRoot: rootPath,
        tree,
        selectedFilePath: null,
        error: null,
      });

      await window.greyboard.watchFolder(rootPath);
      if (unwatchFileChange) {
        unwatchFileChange();
      }
      unwatchFileChange = window.greyboard.onFileChange(() => {
        void get().refreshTree();
      });

      return true;
    } catch (e) {
      set({ error: `Failed to open folder: ${(e as Error).message}` });
      return false;
    }
  },

  refreshTree: async () => {
    try {
      const root = get().workspaceRoot;
      if (!root) {
        return;
      }

      const expandedFolderPaths = collectExpandedFolderPaths(get().tree);
      const tree = await buildWorkspaceTree(root, expandedFolderPaths);
      set({ tree });
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
      const children = await buildWorkspaceTree(folderPath);

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
