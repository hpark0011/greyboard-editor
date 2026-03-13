import type { StateCreator } from "zustand";
import type { MarkdownDocument } from "@greyboard/core/editor";

export interface EditorSlice {
  openDocuments: Map<string, MarkdownDocument>;
  activeDocPath: string | null;
  openFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  setActiveDoc: (path: string) => void;
  updateContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
}

export const createEditorSlice: StateCreator<EditorSlice> = (set, get) => ({
  openDocuments: new Map(),
  activeDocPath: null,

  openFile: async (path: string) => {
    const existing = get().openDocuments.get(path);
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
    set((state) => {
      const docs = new Map(state.openDocuments);
      docs.set(path, doc);
      return { openDocuments: docs, activeDocPath: path };
    });
  },

  closeFile: (path: string) => {
    set((state) => {
      const docs = new Map(state.openDocuments);
      docs.delete(path);
      const activeDocPath =
        state.activeDocPath === path
          ? (docs.keys().next().value ?? null)
          : state.activeDocPath;
      return { openDocuments: docs, activeDocPath };
    });
  },

  setActiveDoc: (path: string) => set({ activeDocPath: path }),

  updateContent: (path: string, content: string) => {
    set((state) => {
      const docs = new Map(state.openDocuments);
      const doc = docs.get(path);
      if (!doc) return state;
      docs.set(path, { ...doc, content, isDirty: true });
      return { openDocuments: docs };
    });
  },

  saveFile: async (path: string) => {
    const doc = get().openDocuments.get(path);
    if (!doc) return;
    const savedContent = doc.content;
    await window.greyboard.writeFile(path, savedContent);
    set((state) => {
      const docs = new Map(state.openDocuments);
      const current = docs.get(path);
      if (!current) return state;
      const stillClean = current.content === savedContent;
      docs.set(path, {
        ...current,
        isDirty: stillClean ? false : current.isDirty,
        lastSavedAt: Date.now(),
      });
      return { openDocuments: docs };
    });
  },
});
