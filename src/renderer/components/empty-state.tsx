import { FolderOpen } from "lucide-react";
import { Button } from "@greyboard/ui/primitives/button";

interface EmptyStateProps {
  workspaceRoot: string | null;
  openFolder: () => void;
}

export function EmptyState({ workspaceRoot, openFolder }: EmptyStateProps) {
  return (
    <div
      className={[
        // Layout & alignment
        "flex flex-col items-center justify-center",
        // Sizing
        "h-full",
        // Spacing
        "gap-4",
        // Typography
        "text-muted-foreground",
      ].join(" ")}
    >
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
  );
}
