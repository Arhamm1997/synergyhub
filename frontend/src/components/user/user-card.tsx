import Image from "next/image";
import { User } from "@/lib/types";
import { RoleBadge } from "@/components/ui/role-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserCardProps {
  user: User;
  className?: string;
  showStatus?: boolean;
}

export function UserCard({ user, className, showStatus = true }: UserCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const statusStyles = {
    Online: "bg-green-500",
    Offline: "bg-gray-400",
    Away: "bg-yellow-500",
    Busy: "bg-red-500",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {showStatus && (
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                  statusStyles[user.status]
                )}
              />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{user.name}</h3>
              <RoleBadge role={user.role} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.department && (
              <p className="text-xs text-muted-foreground">
                {user.department}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}