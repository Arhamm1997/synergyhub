
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, LogOut, User, Settings, LayoutGrid, PlusCircle, UserPlus, Shield, Briefcase, FolderKanban, ListChecks, MessageSquare, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { Role } from "@/lib/types";
import { useUser } from "@/hooks/use-user";
import { api } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RoleBadge } from "@/components/ui/role-badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationPrioritizer } from "@/components/notifications/notification-prioritizer";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListChecks },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/clients", label: "Clients", icon: User },
    { href: "/dashboard/members", label: "Members", icon: UsersIcon },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const inviteFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(1, "Full name is required"),
  role: z.nativeEnum(Role),
  department: z.string().min(1, "Department is required"),
  phoneNumber: z.string().optional(),
  message: z.string().optional()
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

function InviteDialog() {
    const { user } = useUser();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: {
            email: "",
            name: "",
            role: Role.Member,
            department: "",
            phoneNumber: "",
            message: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    async function onSubmit(data: InviteFormValues) {
        if (!user?.id) {
            toast({
                title: 'Error',
                description: 'You must be logged in to send invitations',
                variant: 'destructive',
            });
            return;
        }

        try {
            await api.post('/invitations/send', {
                ...data,
                status: 'Pending'
            });

            toast({
                title: 'Invitation sent',
                description: `An invitation has been sent to ${data.email}`,
            });
            form.reset();
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to send invitation',
                variant: 'destructive',
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserPlus className="h-5 w-5" />
                    <span className="sr-only">Invite members</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your team. They'll receive an email with a link to accept.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(user?.role === Role.SuperAdmin || user?.role === Role.Admin) && (
                                                <SelectItem value={Role.Admin}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-4 w-4" />
                                                            <span>Administrator</span>
                                                        </div>
                                                        <RoleBadge role={Role.Admin} size="sm" />
                                                    </div>
                                                </SelectItem>
                                            )}
                                            <SelectItem value={Role.Member}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>Team Member</span>
                                                    </div>
                                                    <RoleBadge role={Role.Member} size="sm" />
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={Role.Client}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>Client</span>
                                                    </div>
                                                    <RoleBadge role={Role.Client} size="sm" />
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="rounded-lg border p-3">
                                        <p className="text-sm text-muted-foreground">
                                            {field.value === Role.Admin ? 'Full access to manage team, projects, and settings.' :
                                             field.value === Role.Member ? 'Access to assigned projects and tasks.' :
                                             'Limited access to view assigned projects and communicate with team.'}
                                        </p>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineering" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 000-0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personal Message (Optional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Add a personal message to the invitation email" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Sending Invitation...
                                    </>
                                ) : (
                                    'Send Invitation'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function Header() {
  const pathname = usePathname();
  const { user } = useUser();

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
                {user?.avatarUrl ? (
                  <AvatarImage 
                    src={user.avatarUrl} 
                    alt={`${user.name}'s avatar`} 
                  />
                ) : (
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Unknown User'}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user?.email || 'No email'}
                  </p>
                </div>
                {user?.role && <RoleBadge role={user.role} size="sm" />}
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
