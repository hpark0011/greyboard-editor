import { create } from "zustand";
import { createUiSlice, type UiSlice } from "./ui-slice";
import {
  createFileExplorerSlice,
  type FileExplorerSlice,
} from "./file-explorer-slice";
import { createEditorSlice, type EditorSlice } from "./editor-slice";

export type AppStore = UiSlice & FileExplorerSlice & EditorSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createUiSlice(...a),
  ...createFileExplorerSlice(...a),
  ...createEditorSlice(...a),
}));
