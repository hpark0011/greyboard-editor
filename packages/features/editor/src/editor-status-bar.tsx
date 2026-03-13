import { cn } from "@greyboard/ui/lib/utils";

interface EditorStatusBarProps {
  filePath: string;
  isDirty: boolean;
  wordCount: number;
}

export function EditorStatusBar({
  filePath,
  isDirty,
  wordCount,
}: EditorStatusBarProps) {
  const fileName = filePath.split("/").pop() ?? filePath;

  return (
    <div className="flex items-center justify-between border-t px-3 py-1 text-xs text-muted-foreground bg-background">
      <div className="flex items-center gap-2">
        <span className="truncate max-w-[300px]" title={filePath}>
          {fileName}
        </span>
        {isDirty && (
          <span className={cn("inline-block h-2 w-2 rounded-full bg-orange-400")} />
        )}
      </div>
      <span>{wordCount} words</span>
    </div>
  );
}
