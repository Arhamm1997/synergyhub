import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: Role;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role, className, size = "md" }: RoleBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  const roleStyles: Record<Role, string> = {
    [Role.Admin]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
    [Role.Member]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30",
    [Role.SuperAdmin]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30",
    [Role.Client]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        roleStyles[role],
        className
      )}
    >
      {role === Role.Admin ? "Administrator" : 
       role === Role.SuperAdmin ? "Super Admin" :
       role === Role.Client ? "Client" : "Team Member"}
    </span>
  );
}