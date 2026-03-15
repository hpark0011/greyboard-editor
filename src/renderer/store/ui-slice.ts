import type { StateCreator } from "zustand";

const THEME_STORAGE_KEY = "greyboard-theme";

export interface UiSlice {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  panelSizes: [number, number, number];
  theme: "light" | "dark" | "system";
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setPanelSizes: (sizes: [number, number, number]) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  leftSidebarVisible: true,
  rightSidebarVisible: false,
  panelSizes: [20, 60, 20],
  theme: (typeof localStorage !== "undefined"
    ? (localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | "system")
    : null) || "system",
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible })),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible })),
  setPanelSizes: (sizes) => set({ panelSizes: sizes }),
  setTheme: (theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
});
