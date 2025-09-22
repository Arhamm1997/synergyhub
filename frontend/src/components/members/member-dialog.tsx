
"use client";

import { useState, type ReactNode, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Member } from "@/lib/types";
import { Role } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { Shield, User, Briefcase } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(Role),
  department: z.string().min(1, "Department is required"),
  avatarUrl: z.string().optional(),
  details: z.string().optional(),
});

type MemberFormValues = z.infer<typeof formSchema>;

interface MemberDialogProps {
  children?: ReactNode;
  member?: Member;
  onSave: (member: Omit<Member, 'id'> | Member) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDialog({ children, member, onSave, isOpen, onOpenChange }: MemberDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        avatarUrl: member.avatarUrl,
        details: member.details || "",
      });
      setAvatarPreview(member.avatarUrl);
    } else {
      form.reset({
        name: "",
        email: "",
        role: Role.Member, // Default role for new members
        department: "",
        avatarUrl: "",
        details: "",
      });
      setAvatarPreview(null);
    }
  }, [member, form, isOpen]);


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        form.setValue('avatarUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: MemberFormValues) {
    const memberData = {
      name: values.name,
      email: values.email,
      role: values.role,
      department: values.department,
      details: values.details,
      avatarUrl: values.avatarUrl || `https://picsum.photos/seed/${values.name.split(' ').join('')}/200/200`,
      avatarHint: "person portrait",
    };
    onSave(member ? { ...member, ...memberData } : memberData);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update the details for this team member." : "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Avatar preview" />
                    ) : (
                        <AvatarFallback>{form.getValues('name')?.substring(0, 2) || '??'}</AvatarFallback>
                    )}
                </Avatar>
                <div className="flex-grow">
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                    </FormControl>
                     <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full mt-2">
                        Upload Picture
                    </Button>
                     <FormMessage>{form.formState.errors.avatarUrl?.message}</FormMessage>
                </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="jane.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                control={form.control}
                name="role"
                render={({ field }) => {
                  const { user } = useUser();
                  return (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  );
                }}
              />
               <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manual Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any extra notes or details here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{member ? "Save Changes" : "Add Member"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
