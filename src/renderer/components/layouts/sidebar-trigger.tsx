import { cn } from "@greyboard/ui/lib/utils";

function SidebarTriggerVerticalLine({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={cn(
        "w-[1.5px] bg-icon/70 relative rounded-full transition-all duration-200",
        isOpen ? "h-full left-[5px] bg-icon" : "h-[calc(100%-3px)] left-0.5",
      )}
    />
  );
}

export function SidebarTrigger({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-[15px] h-3.5 border-icon border-[1.5px] rounded-[4px] flex items-center">
      <SidebarTriggerVerticalLine isOpen={isOpen} />
    </div>
  );
}
