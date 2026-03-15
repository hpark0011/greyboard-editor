import { cn } from "@greyboard/ui/lib/utils";

function SidebarTriggerVerticalLine({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={cn(
        // Positioning
        "relative",
        // Sizing
        "w-[1.5px]",
        // Shape
        "rounded-full",
        // Background
        "bg-icon/70",
        // Interactive states
        "transition-all duration-200",
        isOpen ? "h-full left-[5px] bg-icon" : "h-[calc(100%-3px)] left-0.5",
      )}
    />
  );
}

export function SidebarTrigger({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={[
        // Layout & alignment
        "flex items-center",
        // Sizing
        "w-[15px] h-3.5",
        // Shape
        "border-icon border-[1.5px] rounded-[4px]",
      ].join(" ")}
    >
      <SidebarTriggerVerticalLine isOpen={isOpen} />
    </div>
  );
}
