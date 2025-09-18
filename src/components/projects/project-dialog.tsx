
"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

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
import { DatePicker } from "@/components/ui/date-picker";
import { AssigneeSelect } from "@/components/clients/assignee-select";
import type { Project } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

const projectStatuses = ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];
const clients = ["Innovate Corp", "QuantumLeap", "Stellar Solutions", "Apex Enterprises"];
const teamMembers = [
    { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: "man portrait" },
    { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: "woman portrait" },
    { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: "man portrait professional" },
    { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: "woman professional" },
];

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client: z.string().min(1, "Client is required"),
  status: z.enum(["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"]),
  deadline: z.date({ required_error: "Deadline is required." }),
  team: z.array(z.string()).min(1, "Please select at least one team member"),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectDialogProps {
  children: ReactNode;
  project?: Project;
  onCreateProject: (project: Omit<Project, 'id' | 'progress'>) => void;
}

export function ProjectDialog({ children, project, onCreateProject }: ProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      client: project?.client || "",
      status: project?.status || "Not Started",
      team: project?.team.map(t => t.name) || [],
    },
  });

  function onSubmit(values: ProjectFormValues) {
    const selectedTeam = teamMembers.filter(member => values.team.includes(member.name));

    const newProject = {
      name: values.name,
      client: values.client,
      status: values.status,
      deadline: format(values.deadline, "yyyy-MM-dd"),
      team: selectedTeam,
    };
    onCreateProject(newProject);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update the details for this project." : "Fill in the details for the new project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mobile App Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <AssigneeSelect
                        assignees={teamMembers}
                        selectedAssignees={field.value}
                        onSelectionChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

             <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2 space-y-2">
                    <FormLabel>Deadline</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{project ? "Save Changes" : "Create Project"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
