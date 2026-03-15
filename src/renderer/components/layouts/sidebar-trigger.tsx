import { cn } from "@greyboard/ui/lib/utils";

function SidebarTriggerVerticalLine({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={cn(
        "relative",
        "w-[1.5px]",
        "transition-all duration-200",
        isOpen
          ? "h-full left-[5px] bg-icon rounded-none"
          : "h-[calc(100%-3px)] left-0.5 rounded-full bg-icon/70",
      )}
    />
  );
}

export function SidebarTrigger({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={[
        "flex items-center",
        "w-[15px] h-3.5",
        "border-icon border-[1.5px] rounded-[4px]",
      ].join(" ")}
    >
      <SidebarTriggerVerticalLine isOpen={isOpen} />
    </div>
  );
}
