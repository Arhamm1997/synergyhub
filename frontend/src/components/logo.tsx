import { Waves } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2" data-sidebar="logo">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Waves className="h-5 w-5" />
      </div>
      <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
        SynergyHub
      </span>
    </div>
  );
}
