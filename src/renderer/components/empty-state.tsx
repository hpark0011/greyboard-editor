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
        "flex flex-col items-center justify-center",
        "h-full",
        "gap-5",
        "text-muted-foreground",
      ].join(" ")}
    >
      <p className="text-sm">
        {workspaceRoot
          ? "Select a file to start editing"
          : "Open a folder to get started"}
      </p>
      {!workspaceRoot && (
        <Button
          variant="primary"
          size="default"
          onClick={openFolder}
          className="rounded-md"
        >
          <span className="text-[13px]">
            Open Folder
          </span>
        </Button>
      )}
    </div>
  );
}
