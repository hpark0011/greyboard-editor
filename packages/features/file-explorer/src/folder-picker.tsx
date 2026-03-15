import { Button } from "@greyboard/ui/primitives/button";

interface FolderPickerProps {
  onOpenFolder: () => void;
}

export function FolderPicker({ onOpenFolder }: FolderPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1.5 p-4 text-muted-foreground">
      <Button
        variant="link"
        size="lg"
        onClick={onOpenFolder}
      >
        Open Folder
      </Button>
    </div>
  );
}
