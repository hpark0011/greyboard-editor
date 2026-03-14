function SidebarTriggerVerticalLine() {
  return (
    <div className="h-[calc(100%-3px)] w-[1.5px] bg-icon relative left-0.5 rounded-full" />
  );
}

export function SidebarTrigger() {
  return (
    <div className="w-[15px] h-3.5 border-icon/50 border-[1.5px] rounded-[4px] flex items-center">
      <SidebarTriggerVerticalLine />
    </div>
  );
}
