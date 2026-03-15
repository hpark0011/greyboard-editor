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

export function AppLayout() {
  useThemeEffect();

  const {
    leftSidebarVisible,
    rightSidebarVisible,
    workspaceRoot,
    openFolder,
    openDocuments,
    activeDocPath,
    updateContent,
    saveFile,
  } = useStore(
    useShallow((s) => ({
      leftSidebarVisible: s.leftSidebarVisible,
      rightSidebarVisible: s.rightSidebarVisible,
      workspaceRoot: s.workspaceRoot,
      openFolder: s.openFolder,
      openDocuments: s.openDocuments,
      activeDocPath: s.activeDocPath,
      updateContent: s.updateContent,
      saveFile: s.saveFile,
    })),
  );

  const activeDoc = activeDocPath ? openDocuments[activeDocPath] : null;
  const editorDefaultSize = 100 - (leftSidebarVisible ? 20 : 0) -
    (rightSidebarVisible ? 20 : 0);

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
          <ResizablePanelGroup direction="horizontal">
            {/* Left sidebar */}
            {leftSidebarVisible && (
              <>
                <ResizablePanel
                  defaultSize={20}
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
              defaultSize={editorDefaultSize}
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
                  defaultSize={20}
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
        </div>
      </div>
    </TooltipProvider>
  );
}
