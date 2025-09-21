
"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { AssigneeSelector } from "./assignee-selector";
import { useMemberStore } from "@/store/member-store";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeName: z.string().min(1, "Assignee is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.date({ required_error: "Due date is required." }),
});

type CreateTaskFormValues = z.infer<typeof formSchema>;

interface CreateTaskDialogProps {
  onCreate: (task: Task) => void;
  children?: ReactNode;
}

export function CreateTaskDialog({ onCreate, children }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
    },
  });

  const { members } = useMemberStore();

  function onSubmit(values: CreateTaskFormValues) {
    const assignee = members.find(m => m.name === values.assigneeName);
    if (!assignee) return;

    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 10000)}`,
      title: values.title,
      description: values.description,
      assignee: {
        name: assignee.name,
        avatarUrl: assignee.avatarUrl,
        avatarHint: assignee.avatarHint,
      },
      priority: values.priority as Priority,
      status: values.status as TaskStatus,
      dueDate: format(values.dueDate, "yyyy-MM-dd"),
    };
    onCreate(newTask);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create Task
                </span>
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Design a new logo" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a detailed description for the task..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <AssigneeSelector value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. High" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
               <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2 space-y-2">
                    <FormLabel>Due Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
             </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
