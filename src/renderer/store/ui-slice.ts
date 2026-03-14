import type { StateCreator } from "zustand";

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
  rightSidebarVisible: true,
  panelSizes: [20, 60, 20],
  theme: (typeof localStorage !== "undefined"
    ? (localStorage.getItem("greyboard-theme") as "light" | "dark" | "system")
    : null) || "system",
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible })),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible })),
  setPanelSizes: (sizes) => set({ panelSizes: sizes }),
  setTheme: (theme) => set({ theme }),
});
