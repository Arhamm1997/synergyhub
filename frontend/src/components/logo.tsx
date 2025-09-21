import { Waves } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={className} data-sidebar="logo">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Waves className="h-5 w-5" />
      </div>
      <span className="text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
        SynergyHub
      </span>
    </div>
  );
}
