import type { StateCreator } from "zustand";
import type { MarkdownDocument } from "@greyboard/core/editor";

export interface EditorSlice {
  openDocuments: Record<string, MarkdownDocument>;
  activeDocPath: string | null;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  setActiveDoc: (path: string) => void;
  updateContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
}

export const createEditorSlice: StateCreator<EditorSlice> = (set, get) => ({
  openDocuments: {},
  activeDocPath: null,

  openFile: async (path: string) => {
    try {
      const existing = get().openDocuments[path];
      if (existing) {
        set({ activeDocPath: path });
        return;
      }
      const content = await window.greyboard.readFile(path);
      const name = path.split("/").pop() ?? path;
      const doc: MarkdownDocument = {
        path,
        name,
        content,
        isDirty: false,
        lastSavedAt: Date.now(),
      };
      set((state) => ({
        openDocuments: { ...state.openDocuments, [path]: doc },
        activeDocPath: path,
      }));
    } catch (e) {
      // Error is surfaced via file-explorer-slice error state
      console.error(`Failed to open ${path}:`, (e as Error).message);
    }
  },

  closeFile: (path: string) => {
    set((state) => {
      const { [path]: _, ...rest } = state.openDocuments;
      const remainingPaths = Object.keys(rest);
      const activeDocPath =
        state.activeDocPath === path
          ? (remainingPaths[0] ?? null)
          : state.activeDocPath;
      return { openDocuments: rest, activeDocPath };
    });
  },

  setActiveDoc: (path: string) => set({ activeDocPath: path }),

  updateContent: (path: string, content: string) => {
    set((state) => {
      const doc = state.openDocuments[path];
      if (!doc) return state;
      return {
        openDocuments: {
          ...state.openDocuments,
          [path]: { ...doc, content, isDirty: true },
        },
      };
    });
  },

  saveFile: async (path: string) => {
    try {
      const doc = get().openDocuments[path];
      if (!doc) return;
      const savedContent = doc.content;
      await window.greyboard.writeFile(path, savedContent);
      set((state) => {
        const current = state.openDocuments[path];
        if (!current) return state;
        const stillClean = current.content === savedContent;
        return {
          openDocuments: {
            ...state.openDocuments,
            [path]: {
              ...current,
              isDirty: stillClean ? false : current.isDirty,
              lastSavedAt: Date.now(),
            },
          },
        };
      });
    } catch (e) {
      console.error(`Failed to save ${path}:`, (e as Error).message);
    }
  },
});
