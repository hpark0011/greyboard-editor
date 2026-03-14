import { Icon } from "@greyboard/ui/components/icon";
import { IconButton } from "@greyboard/ui/components/icon-button";
import { useStore } from "../store";
import { SidebarTrigger } from "./sidebar-trigger";
import { Button } from "@greyboard/ui/primitives/button";
import { Sun, Moon, Monitor } from "lucide-react";

function workspaceName(rootPath: string): string {
  return rootPath.split(/[/\\]/).pop() || rootPath;
}

export function TitleBar() {
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    toggleLeftSidebar,
    toggleRightSidebar,
    workspaceRoot,
    theme,
    setTheme,
  } = useStore();

  const platform = window.greyboard?.platform;
  const isMac = platform === "darwin";
  const isWindows = platform === "win32";

  return (
    <div
      className={`flex h-9 items-center justify-between border-b px-3 titlebar-drag ${
        isMac ? "pl-[72px]" : ""
      } ${isWindows ? "pr-[140px]" : ""}`}
    >
      <div className="flex items-center gap-2 relative">
        <IconButton
          tooltip={leftSidebarVisible ? "Hide sidebar" : "Show sidebar"}
          onClick={toggleLeftSidebar}
          size="sm"
          className=" items-center justify-center flex flex-col"
        >
          <SidebarTrigger />
        </IconButton>
      </div>
      <span className="text-[13px] font-medium">
        {workspaceRoot ? workspaceName(workspaceRoot) : "Greyboard"}
      </span>
      <div className="flex items-center gap-2">
        <IconButton
          tooltip={
            theme === "light"
              ? "Switch to dark mode"
              : theme === "dark"
                ? "Switch to system mode"
                : "Switch to light mode"
          }
          onClick={() =>
            setTheme(
              theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
            )
          }
          size="sm"
        >
          {theme === "light" && <Sun className="h-3.5 w-3.5" />}
          {theme === "dark" && <Moon className="h-3.5 w-3.5" />}
          {theme === "system" && <Monitor className="h-3.5 w-3.5" />}
        </IconButton>
        <Button size="xs" variant="ghost" onClick={toggleRightSidebar}>
          Chat
        </Button>
      </div>
    </div>
  );
}
