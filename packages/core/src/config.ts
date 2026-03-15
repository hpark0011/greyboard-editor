export interface AppConfig {
  lastOpenedFolder: string | null;
  openFilePaths: string[];
  activeFilePath: string | null;
  selectedFilePath: string | null;
  expandedFolderPaths: string[];
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  panelSizes: {
    left: number;
    middle: number;
    right: number;
  };
  theme: "light" | "dark" | "system";
  editorFontSize: number;
}

export const defaultConfig: AppConfig = {
  lastOpenedFolder: null,
  openFilePaths: [],
  activeFilePath: null,
  selectedFilePath: null,
  expandedFolderPaths: [],
  leftSidebarVisible: true,
  rightSidebarVisible: false,
  panelSizes: { left: 20, middle: 60, right: 20 },
  theme: "system",
  editorFontSize: 14,
};
