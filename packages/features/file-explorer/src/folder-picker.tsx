import { FolderOpen } from "lucide-react";
import { Button } from "@greyboard/ui/primitives/button";

interface FolderPickerProps {
  onOpenFolder: () => void;
}

export function FolderPicker({ onOpenFolder }: FolderPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4 text-muted-foreground">
      <FolderOpen className="h-12 w-12" />
      <p className="text-sm">No folder open</p>
      <Button variant="outline" size="sm" onClick={onOpenFolder}>
        Open Folder
      </Button>
    </div>
  );
}
