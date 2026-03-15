import type { StateCreator } from "zustand";
import type { AppConfig } from "@greyboard/core/config";

export interface UiSlice {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  panelSizes: [number, number, number];
  theme: AppConfig["theme"];
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setPanelSizes: (sizes: [number, number, number]) => void;
  setTheme: (theme: AppConfig["theme"]) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  leftSidebarVisible: true,
  rightSidebarVisible: false,
  panelSizes: [20, 60, 20],
  theme: window.greyboard.initialTheme,
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible })),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible })),
  setPanelSizes: (sizes) => set({ panelSizes: sizes }),
  setTheme: (theme) => set({ theme }),
});
