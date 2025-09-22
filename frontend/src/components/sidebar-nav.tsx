
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Users,
  Settings,
  FolderKanban,
  Users as UsersIcon,
  Building2,
  UserPlus,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

import { Logo } from "@/components/logo";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/members", label: "Members", icon: UsersIcon },
  { href: "/dashboard/business", label: "My Business", icon: Building2 },
  { 
    href: "/dashboard/admin-requests", 
    label: "Admin Requests", 
    icon: UserPlus,
    adminOnly: true
  },
];

const settingsNav = [
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <Separator />
         <SidebarMenu>
            {settingsNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={{ children: item.label }}
                    >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
