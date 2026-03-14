import { Monitor } from "lucide-react";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";

type Theme = "light" | "dark" | "system";

const nextTheme: Record<Theme, Theme> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const icons: Record<Theme, React.ReactNode> = {
  light: <Icon name="SunMaxFillIcon" className="size-4.5" />,
  dark: <Icon name="MoonFillIcon" className="size-4" />,
  system: <Monitor className="size-3.5" />,
};

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <IconButton
      onClick={() => onThemeChange(nextTheme[theme])}
      size="icon-xs"
    >
      {icons[theme]}
    </IconButton>
  );
}
