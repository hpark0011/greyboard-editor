import { useEffect } from "react";
import { useStore } from "../store";

export function useThemeEffect() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const applyTheme = (mode: "light" | "dark" | "system") => {
      const resolved =
        mode === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : mode;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);
}
