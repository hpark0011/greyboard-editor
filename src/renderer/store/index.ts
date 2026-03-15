import { create } from "zustand";
import type { AppConfig } from "@greyboard/core/config";
import { createUiSlice, type UiSlice } from "./ui-slice";
import {
  createFileExplorerSlice,
  type FileExplorerSlice,
} from "./file-explorer-slice";
import { createEditorSlice, type EditorSlice } from "./editor-slice";
import { collectExpandedFolderPaths, treeContainsPath } from "./workspace-tree";

type SessionRestoreStatus = "idle" | "restoring" | "ready";

interface SessionSlice {
  openFolder: () => Promise<void>;
  sessionRestoreStatus: SessionRestoreStatus;
  restoreSession: () => Promise<void>;
}

export type AppStore =
  & UiSlice
  & FileExplorerSlice
  & EditorSlice
  & SessionSlice;

type SessionConfigPatch = Pick<
  AppConfig,
  | "lastOpenedFolder"
  | "openFilePaths"
  | "activeFilePath"
  | "selectedFilePath"
  | "expandedFolderPaths"
  | "leftSidebarVisible"
  | "rightSidebarVisible"
  | "panelSizes"
  | "theme"
>;

function toPanelSizesTuple(
  panelSizes: AppConfig["panelSizes"]
): [number, number, number] {
  return [panelSizes.left, panelSizes.middle, panelSizes.right];
}

function toPanelSizesConfig(
  panelSizes: [number, number, number]
): AppConfig["panelSizes"] {
  return {
    left: panelSizes[0],
    middle: panelSizes[1],
    right: panelSizes[2],
  };
}

function createSessionSnapshot(state: AppStore): SessionConfigPatch {
  return {
    lastOpenedFolder: state.workspaceRoot,
    openFilePaths: Object.keys(state.openDocuments),
    activeFilePath: state.activeDocPath,
    selectedFilePath: state.selectedFilePath,
    expandedFolderPaths: collectExpandedFolderPaths(state.tree),
    leftSidebarVisible: state.leftSidebarVisible,
    rightSidebarVisible: state.rightSidebarVisible,
    panelSizes: toPanelSizesConfig(state.panelSizes),
    theme: state.theme,
  };
}

export const useStore = create<AppStore>()((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createFileExplorerSlice(set, get, api),
  ...createEditorSlice(set, get, api),

  sessionRestoreStatus: "idle",

  openFolder: async () => {
    try {
      const folderPath = await window.greyboard.selectFolder();
      if (!folderPath) {
        return;
      }

      const initialized = await get().initializeWorkspace(folderPath);
      if (!initialized) {
        return;
      }

      set({
        openDocuments: {},
        activeDocPath: null,
        selectedFilePath: null,
      });
    } catch (e) {
      set({ error: `Failed to open folder: ${(e as Error).message}` });
    }
  },

  restoreSession: async () => {
    if (get().sessionRestoreStatus !== "idle") {
      return;
    }

    set({ sessionRestoreStatus: "restoring" });

    try {
      const config = await window.greyboard.loadConfig();
      set({
        leftSidebarVisible: config.leftSidebarVisible,
        rightSidebarVisible: config.rightSidebarVisible,
        panelSizes: toPanelSizesTuple(config.panelSizes),
        theme: config.theme,
      });

      if (!config.lastOpenedFolder) {
        set({ sessionRestoreStatus: "ready" });
        return;
      }

      const restoredWorkspaceRoot = await window.greyboard.restoreWorkspace(
        config.lastOpenedFolder
      );

      if (!restoredWorkspaceRoot) {
        set({ sessionRestoreStatus: "ready" });
        return;
      }

      const initialized = await get().initializeWorkspace(
        restoredWorkspaceRoot,
        config.expandedFolderPaths
      );

      if (!initialized) {
        set({ sessionRestoreStatus: "ready" });
        return;
      }

      const restoredOpenFilePaths: string[] = [];
      for (const filePath of config.openFilePaths) {
        await get().openFile(filePath);
        if (get().openDocuments[filePath]) {
          restoredOpenFilePaths.push(filePath);
        }
      }

      const { openDocuments, tree } = get();
      const selectedFilePath = config.selectedFilePath &&
          treeContainsPath(tree, config.selectedFilePath)
        ? config.selectedFilePath
        : null;
      const activeDocPath = config.activeFilePath &&
          openDocuments[config.activeFilePath]
        ? config.activeFilePath
        : (restoredOpenFilePaths.at(-1) ?? null);

      set({
        selectedFilePath,
        activeDocPath,
        sessionRestoreStatus: "ready",
      });
    } catch (e) {
      console.error("Failed to restore previous session:", e);
      set({ sessionRestoreStatus: "ready" });
    }
  },
}));

let persistTimeout: ReturnType<typeof setTimeout> | null = null;
let lastPersistedSnapshotJson: string | null = null;
let queuedSnapshot: SessionConfigPatch | null = null;
let queuedSnapshotJson: string | null = null;

function scheduleSessionPersist(
  snapshot: SessionConfigPatch,
  snapshotJson: string
) {
  queuedSnapshot = snapshot;
  queuedSnapshotJson = snapshotJson;

  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }

  persistTimeout = setTimeout(() => {
    if (!queuedSnapshot || !queuedSnapshotJson) {
      return;
    }

    const snapshotToPersist = queuedSnapshot;
    const snapshotJsonToPersist = queuedSnapshotJson;
    queuedSnapshot = null;
    queuedSnapshotJson = null;

    void window.greyboard.updateConfig(snapshotToPersist)
      .then(() => {
        lastPersistedSnapshotJson = snapshotJsonToPersist;
      })
      .catch((error) => {
        console.error("Failed to persist session state:", error);
      });
  }, 150);
}

const unsubscribeSessionPersistence = useStore.subscribe((state) => {
  if (state.sessionRestoreStatus !== "ready") {
    return;
  }

  const snapshot = createSessionSnapshot(state);
  const snapshotJson = JSON.stringify(snapshot);
  if (
    snapshotJson === lastPersistedSnapshotJson ||
    snapshotJson === queuedSnapshotJson
  ) {
    return;
  }

  scheduleSessionPersist(snapshot, snapshotJson);
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unsubscribeSessionPersistence();
    if (persistTimeout) {
      clearTimeout(persistTimeout);
    }
  });
}
