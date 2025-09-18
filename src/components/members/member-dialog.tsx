
"use client";

import { useState, type ReactNode } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Member } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  avatarUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
  details: z.string().optional(),
});

type MemberFormValues = z.infer<typeof formSchema>;

interface MemberDialogProps {
  children: ReactNode;
  member?: Member;
  onCreateMember: (member: Omit<Member, 'id'>) => void;
}

export function MemberDialog({ children, member, onCreateMember }: MemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      role: member?.role || "",
      department: member?.department || "",
      avatarUrl: member?.avatarUrl || "",
      details: member?.details || "",
    },
  });

  function onSubmit(values: MemberFormValues) {
    const newMember = {
      name: values.name,
      email: values.email,
      role: values.role,
      department: values.department,
      details: values.details,
      avatarUrl: values.avatarUrl || `https://picsum.photos/seed/${values.name.split(' ').join('')}/200/200`,
      avatarHint: "person portrait",
    };
    onCreateMember(newMember);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update the details for this team member." : "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Project Manager" {...field} />
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
                        <Input placeholder="e.g. Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{member ? "Save Changes" : "Add Member"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
