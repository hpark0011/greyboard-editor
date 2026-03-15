import { File } from "lucide-react";
import {
  ArrowTriangleRightFillIcon,
  DocMdDarkIcon,
  DocMdLightIcon,
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
  fileName,
}: {
  isFolder: boolean;
  expanded: boolean;
  fileName?: string;
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
  const isMd = fileName?.endsWith(".md");
  return (
    <>
      <span className="w-[7px] shrink-0" />
      {isMd
        ? (
          <>
            <DocMdLightIcon className={cn("size-[22px]", "dark:hidden")} />
            <DocMdDarkIcon className={cn("size-[22px]", "hidden dark:block")} />
          </>
        )
        : (
          <>
            <DocTextLightIcon className={cn("size-[22px]", "dark:hidden")} />
            <DocTextDarkIcon
              className={cn("size-[22px]", "hidden dark:block")}
            />
          </>
        )}
    </>
  );
}
