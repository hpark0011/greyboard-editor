import { useStore } from "../store";
import {
  ResizableHandle,
  ResizableLayout,
  ResizablePanel,
} from "@greyboard/ui/components/resizable-layout";
import { TooltipProvider } from "@greyboard/ui/primitives/tooltip";
import { FileTree, FolderPicker } from "@greyboard/file-explorer";
import { MarkdownEditor } from "@greyboard/editor";
import {
  FolderOpen,
  MessageSquare,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import { IconButton } from "@greyboard/ui/components/icon-button";
import { Button } from "@greyboard/ui/primitives/button";

export function AppLayout() {
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    toggleLeftSidebar,
    toggleRightSidebar,
    workspaceRoot,
    tree,
    selectedFilePath,
    openFolder,
    refreshTree,
    toggleFolder,
    setSelectedFile,
    openDocuments,
    activeDocPath,
    openFile,
    updateContent,
    saveFile,
  } = useStore();

  const activeDoc = activeDocPath ? openDocuments.get(activeDocPath) : null;

  const handleFileClick = async (path: string) => {
    setSelectedFile(path);
    await openFile(path);
  };

  const handleSetTree = (
    newTree: typeof tree | ((prev: typeof tree) => typeof tree),
  ) => {
    if (typeof newTree === "function") {
      useStore.setState((state) => ({ tree: newTree(state.tree) }));
    } else {
      useStore.setState({ tree: newTree });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Title bar area */}
        <div className="flex h-10 items-center justify-between border-b px-3 app-drag-region">
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

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <ResizableLayout>
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
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b px-3 py-1.5">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Explorer
                      </span>
                      <IconButton
                        tooltip="Open Folder"
                        onClick={openFolder}
                        size="sm"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                    {workspaceRoot
                      ? (
                        <FileTree
                          tree={tree}
                          selectedPath={selectedFilePath}
                          workspaceRoot={workspaceRoot}
                          onFileClick={handleFileClick}
                          onToggleFolder={toggleFolder}
                          onRefreshTree={refreshTree}
                          onSetTree={handleSetTree}
                        />
                      )
                      : <FolderPicker onOpenFolder={openFolder} />}
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* Editor */}
            <ResizablePanel defaultSize={60} minSize={30} order={2} id="editor">
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
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                    <p className="text-sm">
                      {workspaceRoot
                        ? "Select a file to start editing"
                        : "Open a folder to get started"}
                    </p>
                    {!workspaceRoot && (
                      <Button variant="outline" size="sm" onClick={openFolder}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open Folder
                      </Button>
                    )}
                  </div>
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
                    <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
                      AI Assistant coming soon
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizableLayout>
        </div>
      </div>
    </TooltipProvider>
  );
}
