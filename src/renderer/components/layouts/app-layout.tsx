import { useStore } from "../../store";
import { useThemeEffect } from "../../hooks/use-theme-effect";
import { useShallow } from "zustand/react/shallow";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@greyboard/ui/primitives/resizable";
import { TooltipProvider } from "@greyboard/ui/primitives/tooltip";
import { MarkdownEditor } from "@greyboard/editor";
import { MessageSquare } from "lucide-react";
import { TitleBar } from "./title-bar";
import { ExplorerPanel } from "./explorer-panel";
import { EmptyState } from "../empty-state";

function normalizePanelSizes(sizes: number[]): number[] {
  const safeSizes = sizes.map((size) => (size > 0 ? size : 1));
  const total = safeSizes.reduce((sum, size) => sum + size, 0);

  return safeSizes.map((size) => size / total * 100);
}

function getVisiblePanelDefaults(
  panelSizes: [number, number, number],
  leftSidebarVisible: boolean,
  rightSidebarVisible: boolean
) {
  if (leftSidebarVisible && rightSidebarVisible) {
    const [left, editor, right] = normalizePanelSizes(panelSizes);
    return { left, editor, right };
  }

  if (leftSidebarVisible) {
    const [left, editor] = normalizePanelSizes([panelSizes[0], panelSizes[1]]);
    return { left, editor, right: panelSizes[2] };
  }

  if (rightSidebarVisible) {
    const [editor, right] = normalizePanelSizes([panelSizes[1], panelSizes[2]]);
    return { left: panelSizes[0], editor, right };
  }

  return { left: panelSizes[0], editor: 100, right: panelSizes[2] };
}

function mergeVisiblePanelSizes(
  previousSizes: [number, number, number],
  nextVisibleSizes: number[],
  leftSidebarVisible: boolean,
  rightSidebarVisible: boolean
): [number, number, number] {
  if (leftSidebarVisible && rightSidebarVisible && nextVisibleSizes.length === 3) {
    return [
      nextVisibleSizes[0],
      nextVisibleSizes[1],
      nextVisibleSizes[2],
    ];
  }

  if (leftSidebarVisible && nextVisibleSizes.length === 2) {
    return [
      nextVisibleSizes[0],
      nextVisibleSizes[1],
      previousSizes[2],
    ];
  }

  if (rightSidebarVisible && nextVisibleSizes.length === 2) {
    return [
      previousSizes[0],
      nextVisibleSizes[0],
      nextVisibleSizes[1],
    ];
  }

  return previousSizes;
}

export function AppLayout() {
  useThemeEffect();

  const {
    leftSidebarVisible,
    rightSidebarVisible,
    panelSizes,
    setPanelSizes,
    workspaceRoot,
    openFolder,
    openDocuments,
    activeDocPath,
    sessionRestoreStatus,
    updateContent,
    saveFile,
  } = useStore(
    useShallow((s) => ({
      leftSidebarVisible: s.leftSidebarVisible,
      rightSidebarVisible: s.rightSidebarVisible,
      panelSizes: s.panelSizes,
      setPanelSizes: s.setPanelSizes,
      workspaceRoot: s.workspaceRoot,
      openFolder: s.openFolder,
      openDocuments: s.openDocuments,
      activeDocPath: s.activeDocPath,
      sessionRestoreStatus: s.sessionRestoreStatus,
      updateContent: s.updateContent,
      saveFile: s.saveFile,
    })),
  );

  const activeDoc = activeDocPath ? openDocuments[activeDocPath] : null;
  const panelDefaults = getVisiblePanelDefaults(
    panelSizes,
    leftSidebarVisible,
    rightSidebarVisible
  );
  const isRestoringSession = sessionRestoreStatus !== "ready";

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={[
          "flex flex-col",
          "h-screen",
          "bg-background",
          "text-foreground",
        ].join(" ")}
      >
        <TitleBar />

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {isRestoringSession
            ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Restoring previous session...
              </div>
            )
            : (
              <ResizablePanelGroup
                direction="horizontal"
                onLayout={(nextVisibleSizes) => {
                  setPanelSizes(
                    mergeVisiblePanelSizes(
                      panelSizes,
                      nextVisibleSizes as number[],
                      leftSidebarVisible,
                      rightSidebarVisible
                    )
                  );
                }}
              >
            {/* Left sidebar */}
                {leftSidebarVisible && (
                  <>
                    <ResizablePanel
                      defaultSize={panelDefaults.left}
                      minSize={15}
                      maxSize={35}
                      collapsible
                      collapsedSize={0}
                      order={1}
                      id="left-sidebar"
                    >
                      <ExplorerPanel />
                    </ResizablePanel>
                    <ResizableHandle />
                  </>
                )}

                {/* Editor */}
                <ResizablePanel
                  defaultSize={panelDefaults.editor}
                  minSize={30}
                  order={2}
                  id="editor"
                >
                  {activeDoc
                    ? (
                      <MarkdownEditor
                        content={activeDoc.content}
                        filePath={activeDoc.path}
                        isDirty={activeDoc.isDirty}
                        onUpdate={(content) =>
                          updateContent(activeDoc.path, content)}
                        onSave={() => saveFile(activeDoc.path)}
                      />
                    )
                    : (
                      <EmptyState
                        workspaceRoot={workspaceRoot}
                        openFolder={openFolder}
                      />
                    )}
                </ResizablePanel>

                {/* Right sidebar */}
                {rightSidebarVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel
                      defaultSize={panelDefaults.right}
                      minSize={15}
                      maxSize={35}
                      collapsible
                      collapsedSize={0}
                      order={3}
                      id="right-sidebar"
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex items-center gap-2 border-b px-3 py-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            AI Assistant
                          </span>
                        </div>
                        <div
                          className={[
                            "flex flex-1 items-center justify-center",
                            "p-4",
                            "text-sm text-muted-foreground",
                          ].join(" ")}
                        >
                          AI Assistant coming soon
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            )}
        </div>
      </div>
    </TooltipProvider>
  );
}
