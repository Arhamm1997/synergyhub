
"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

const priorities: Priority[] = ["Low", "Medium", "High"];
const statuses: TaskStatus[] = ["Todo", "In Progress", "Done", "Cancelled"];
const assignees = [
    { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: "man portrait" },
    { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: "woman portrait" },
    { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: "man portrait professional" },
    { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: "woman professional" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeName: z.string().min(1, "Assignee is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Todo", "In Progress", "Done", "Cancelled"]),
  dueDate: z.date({ required_error: "Due date is required." }),
});

type CreateTaskFormValues = z.infer<typeof formSchema>;

interface CreateTaskDialogProps {
  onCreate: (task: Task) => void;
}

export function CreateTaskDialog({ onCreate }: CreateTaskDialogProps) {
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

  function onSubmit(values: CreateTaskFormValues) {
    const selectedAssignee = assignees.find(a => a.name === values.assigneeName);
    if (!selectedAssignee) return;

    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 10000)}`,
      title: values.title,
      description: values.description,
      assignee: selectedAssignee,
      priority: values.priority,
      status: values.status,
      dueDate: format(values.dueDate, "yyyy-MM-dd"),
    };
    onCreate(newTask);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Task
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
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
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
