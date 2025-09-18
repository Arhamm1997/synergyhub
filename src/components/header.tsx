"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, LogOut, User, Settings, LayoutGrid, PlusCircle, UserPlus, Mail } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationPrioritizer } from "@/components/notifications/notification-prioritizer";
import placeholderImages from "@/lib/placeholder-images.json";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/tasks", label: "Tasks" },
    { href: "/dashboard/messages", label: "Messages" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/settings", label: "Settings" },
];

function InviteDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserPlus className="h-5 w-5" />
                    <span className="sr-only">Invite members</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Members</DialogTitle>
                    <DialogDescription>
                        Enter the email addresses of the people you want to invite.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            <Mail className="h-5 w-5 inline-block" />
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Send Invitation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function Header() {
  const pathname = usePathname();
  const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1');

  const getPageTitle = () => {
    const currentNav = navItems.find(item => pathname.startsWith(item.href));
    return currentNav ? currentNav.label : "SynergyHub";
  };
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-xl">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <h1 className="font-semibold text-lg">{getPageTitle()}</h1>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 md:ml-auto">
        <form className="ml-auto flex-1 sm:flex-initial hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks, projects..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <InviteDialog />
        <NotificationPrioritizer />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                 {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User avatar" data-ai-hint={userAvatar.imageHint} />}
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Alex Moran</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Team Lead
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard"><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/settings"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/"><LogOut className="mr-2 h-4 w-4" />Log out</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
