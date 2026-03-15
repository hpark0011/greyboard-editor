import { File } from "lucide-react";
import {
  ArrowTriangleRightFillIcon,
  DocTextDarkIcon,
  DocTextLightIcon,
  FolderClosedDarkIcon,
  FolderClosedLightIcon,
  FolderOpenDarkIcon,
  FolderOpenLightIcon,
} from "@feel-good/icons";
import { cn } from "@greyboard/ui/lib/utils";

const folderIconClass = "size-5 shrink-0";

export function FileTreeIcons({
  isFolder,
  expanded,
}: {
  isFolder: boolean;
  expanded: boolean;
}) {
  if (isFolder) {
    return (
      <>
        <ArrowTriangleRightFillIcon
          className={cn(
            "h-2 w-2 shrink-0 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90",
          )}
        />
        {expanded
          ? (
            <>
              <FolderOpenLightIcon
                className={cn(folderIconClass, "dark:hidden")}
              />
              <FolderOpenDarkIcon
                className={cn(folderIconClass, "hidden dark:block")}
              />
            </>
          )
          : (
            <>
              <FolderClosedLightIcon
                className={cn(folderIconClass, "dark:hidden")}
              />
              <FolderClosedDarkIcon
                className={cn(folderIconClass, "hidden dark:block")}
              />
            </>
          )}
      </>
    );
  }
  return (
    <>
      <span className="w-3.5 shrink-0" />
      <DocTextLightIcon className={cn("size-5", "dark:hidden")} />
      <DocTextDarkIcon className={cn("size-5", "hidden dark:block")} />
    </>
  );
}
