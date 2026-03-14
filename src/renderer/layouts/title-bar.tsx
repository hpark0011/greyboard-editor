import { useStore } from "../store";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";

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
  } = useStore();

  const platform = window.greyboard?.platform;
  const isMac = platform === "darwin";
  const isWindows = platform === "win32";

  return (
    <div
      className={`flex h-10 items-center justify-between border-b px-3 titlebar-drag ${isMac ? "pl-[80px]" : ""} ${isWindows ? "pr-[140px]" : ""}`}
    >
      <div className="flex items-center gap-2">
        <IconButton
          tooltip={leftSidebarVisible ? "Hide sidebar" : "Show sidebar"}
          onClick={toggleLeftSidebar}
          size="sm"
        >
          <PanelLeftClose className="h-4 w-4" />
        </IconButton>
        <span className="text-sm font-medium">
          {workspaceRoot ? workspaceName(workspaceRoot) : "Greyboard"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          tooltip={rightSidebarVisible ? "Hide AI panel" : "Show AI panel"}
          onClick={toggleRightSidebar}
          size="sm"
        >
          <PanelRightClose className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
