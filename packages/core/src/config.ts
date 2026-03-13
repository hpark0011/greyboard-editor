export interface AppConfig {
  lastOpenedFolder: string | null;
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
  panelSizes: { left: 20, middle: 60, right: 20 },
  theme: "system",
  editorFontSize: 14,
};
