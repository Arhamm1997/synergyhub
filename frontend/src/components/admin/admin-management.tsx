"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAdminStore } from "@/store/admin-store";
import { Role, AdminUser, AdminInvitation } from "@/lib/types";
import {
  UserPlus,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  MoreVertical,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(Role),
});

export function AdminManagement() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const {
    admins,
    invitations,
    isLoading,
    addAdmin,
    removeAdmin,
    updateAdminRole,
    toggleAdminStatus,
    createInvitation,
    revokeInvitation,
  } = useAdminStore();

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: Role.Admin,
    },
  });

  const onSubmit = async (values: z.infer<typeof inviteFormSchema>) => {
    try {
      await createInvitation(values.email, values.role);
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${values.email}`,
      });
      setIsInviteDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    try {
      await removeAdmin(admin.id);
      toast({
        title: "Admin removed",
        description: `${admin.name} has been removed from administrators`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove administrator",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    try {
      await toggleAdminStatus(admin.id);
      const statusText = admin.isActive ? "deactivated" : "activated";
      toast({
        title: `Admin ${statusText}`,
        description: `${admin.name}'s account has been ${statusText}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (admin: AdminUser, newRole: Role) => {
    try {
      await updateAdminRole(admin.id, newRole);
      toast({
        title: "Role updated",
        description: `${admin.name}'s role has been updated to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvitation = async (invitation: AdminInvitation) => {
    try {
      await revokeInvitation(invitation.id);
      toast({
        title: "Invitation revoked",
        description: `Invitation to ${invitation.email} has been revoked`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administrators</h2>
          <p className="text-muted-foreground">
            Manage administrators and their permissions
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      <div className="space-y-8">
        {/* Current Admins Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Administrators</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatarUrl} />
                          <AvatarFallback>
                            {admin.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {admin.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          admin.isActive
                            ? "text-green-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {admin.isActive ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {admin.isActive ? "Active" : "Inactive"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {admin.lastActive
                          ? format(admin.lastActive, "MMM d, yyyy")
                          : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {Object.values(Role).map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleUpdateRole(admin, role)}
                              disabled={role === admin.role}
                            >
                              Make {role}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(admin)}
                          >
                            {admin.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveAdmin(admin)}
                            className="text-red-600"
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pending Invitations Table */}
        {invitations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell>{invitation.role}</TableCell>
                      <TableCell>{invitation.invitedBy}</TableCell>
                      <TableCell>
                        {format(invitation.expiresAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvitation(invitation)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Admin Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Administrator</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new administrator to your organization.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Role).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}