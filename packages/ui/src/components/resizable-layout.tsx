import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { cn } from "../lib/utils";

interface ResizableLayoutProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  className?: string;
  onLayout?: (sizes: number[]) => void;
}

function ResizableLayout({
  children,
  direction = "horizontal",
  className,
  onLayout,
}: ResizableLayoutProps) {
  return (
    <PanelGroup
      direction={direction}
      className={cn("h-full", className)}
      onLayout={onLayout}
    >
      {children}
    </PanelGroup>
  );
}

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
  onCollapse?: () => void;
  onExpand?: () => void;
  className?: string;
  id?: string;
  order?: number;
}

function ResizablePanel({
  children,
  defaultSize,
  minSize,
  maxSize,
  collapsible,
  collapsedSize,
  onCollapse,
  onExpand,
  className,
  id,
  order,
}: ResizablePanelProps) {
  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      collapsible={collapsible}
      collapsedSize={collapsedSize}
      onCollapse={onCollapse}
      onExpand={onExpand}
      className={cn("", className)}
      id={id}
      order={order}
    >
      {children}
    </Panel>
  );
}

function ResizableHandle({ className }: { className?: string }) {
  return (
    <PanelResizeHandle
      className={cn(
        // Layout & alignment
        "flex items-center justify-center",
        // Positioning
        "relative",
        // Sizing
        "w-px",
        // Background
        "bg-border",
        // Pseudo-element (hit area)
        "after:absolute after:inset-y-0 after:-left-1 after:-right-1 after:content-['']",
        // Interactive states
        "hover:bg-primary/20 transition-colors",
        className
      )}
    />
  );
}

export { ResizableLayout, ResizablePanel, ResizableHandle };
