
"use client";

import { useState, type ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";

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
import { DatePicker } from "@/components/ui/date-picker";
import { AssigneeSelect } from "@/components/clients/assignee-select";
import type { Project, ProjectStatus } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

const teamMembers = [
    { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: "man portrait" },
    { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: "woman portrait" },
    { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: "man portrait professional" },
    { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: "woman professional" },
];

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required."),
  deadline: z.date({ required_error: "Deadline is required." }),
  team: z.array(z.string()).min(1, "Please select at least one team member"),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectDialogProps {
  children?: ReactNode;
  project?: Project;
  onSave: (project: Omit<Project, 'id' | 'progress' | 'tasks'> | Project) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectDialog({ children, project, onSave, isOpen, onOpenChange }: ProjectDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen && project) {
      form.reset({
        name: project.name,
        client: project.client,
        description: project.description || "",
        status: project.status,
        deadline: parseISO(project.deadline),
        team: project.team.map(t => t.name),
      });
    } else if (isOpen && !project) {
        form.reset({
            name: "",
            client: "",
            description: "",
            status: "Not Started",
            deadline: undefined,
            team: [],
        });
    }
  }, [project, form, isOpen]);


  function onSubmit(values: ProjectFormValues) {
    const selectedTeam = teamMembers.filter(member => values.team.includes(member.name));

    const projectData = {
      name: values.name,
      client: values.client,
      description: values.description,
      status: values.status as ProjectStatus,
      deadline: format(values.deadline, "yyyy-MM-dd"),
      team: selectedTeam,
    };
    
    if (project) {
        onSave({ ...project, ...projectData });
    } else {
        onSave(projectData as Omit<Project, 'id' | 'progress' | 'tasks'>);
    }
    
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the project..." {...field} />
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
                     <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                    </FormControl>
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
                    <FormControl>
                        <Input placeholder="e.g. In Progress" {...field} />
                    </FormControl>
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
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{project ? "Save Changes" : "Create Project"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
