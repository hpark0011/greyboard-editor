import { Monitor, Moon, Sun } from "lucide-react";
import { IconButton } from "./icon-button";

type Theme = "light" | "dark" | "system";

const nextTheme: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const tooltipLabel: Record<Theme, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system mode",
  system: "Switch to light mode",
};

const icons: Record<Theme, React.ReactNode> = {
  light: <Sun className="h-3.5 w-3.5 " />,
  dark: <Moon className="h-3.5 w-3.5 " />,
  system: <Monitor className="h-3.5 w-3.5 " />,
};

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <IconButton
      tooltip={tooltipLabel[theme]}
      onClick={() => onThemeChange(nextTheme[theme])}
      size="icon-xs"
    >
      {icons[theme]}
    </IconButton>
  );
}
