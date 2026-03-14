import { useStore } from "../store";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";

const isMac = window.greyboard.platform === "darwin";

export function TitleBar() {
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    toggleLeftSidebar,
    toggleRightSidebar,
    workspaceRoot,
  } = useStore();

  return (
    <div
      className={`flex h-10 items-center justify-between border-b px-3 titlebar-drag ${isMac ? "pl-[80px]" : ""}`}
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
          {workspaceRoot ? workspaceRoot.split("/").pop() : "Greyboard"}
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
