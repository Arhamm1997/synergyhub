
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import {
  MessageSquare,
  Paperclip,
  Send,
  User,
  Calendar,
  Flag,
  CheckCircle,
  AlignLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeName: z.string().min(1, "Assignee is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  dueDate: z.date({ required_error: "Due date is required." }),
});

type TaskFormValues = z.infer<typeof formSchema>;

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdateTask: (task: Task) => void;
}

export function TaskDetailDialog({ open, onOpenChange, task, onUpdateTask }: TaskDetailDialogProps) {
    const { toast } = useToast();
    const [comment, setComment] = useState("");

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        title: task.title,
        description: task.description || "",
        assigneeName: task.assignee.name,
        priority: task.priority,
        status: task.status,
        dueDate: parseISO(task.dueDate),
        },
  });

  const onSubmit = (values: TaskFormValues) => {
    const updatedTask: Task = {
      ...task,
      ...values,
      assignee: {
        name: values.assigneeName,
        avatarUrl: task.assignee.avatarUrl,
        avatarHint: task.assignee.avatarHint,
      },
      dueDate: format(values.dueDate, "yyyy-MM-dd"),
      priority: values.priority as Priority,
      status: values.status as TaskStatus
    };
    onUpdateTask(updatedTask);
    onOpenChange(false);
  };

  const handleSendComment = () => {
    if (comment.trim() === "") return;
    toast({
        title: "Comment Sent",
        description: `Your comment has been sent to ${task.assignee.name}.`,
    });
    setComment("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] grid grid-cols-1 md:grid-cols-3 gap-8 p-0">
        <div className="md:col-span-2 p-6 flex flex-col">
          <DialogHeader className="mb-4">
            <DialogTitle>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <Input {...field} className="text-2xl font-bold border-0 shadow-none -ml-2 focus-visible:ring-0" />
                    )}
                />
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 flex-grow">
             <div className="flex items-start gap-4">
                <AlignLeft className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="w-full">
                    <h3 className="font-semibold mb-2">Description</h3>
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <Textarea {...field} placeholder="Add a more detailed description..." className="min-h-[100px]" />
                        )}
                    />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                 <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-muted-foreground" /> Comments</h3>
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl} />
                        <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div className="relative w-full">
                         <Textarea 
                            placeholder="Write a comment..." 
                            className="pr-24" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                         />
                         <div className="absolute bottom-2 right-2 flex items-center gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                            <Button size="sm" onClick={handleSendComment}><Send className="h-4 w-4" /></Button>
                         </div>
                    </div>
                 </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-6 rounded-r-lg flex flex-col gap-6 overflow-y-auto">
           <h3 className="font-semibold">Details</h3>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="assigneeName"
                    render={({ field }) => (
                    <FormItem className="flex items-center">
                        <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Assignee</FormLabel>
                        <FormControl>
                           <Input placeholder="Select assignee" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                    <FormItem className="flex items-center">
                        <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Due Date</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem className="flex items-center">
                        <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4" /> Status</FormLabel>
                         <FormControl>
                           <Input placeholder="Select status" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                    <FormItem className="flex items-center">
                        <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><Flag className="h-4 w-4" /> Priority</FormLabel>
                        <FormControl>
                           <Input placeholder="Select priority" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">Save Changes</Button>
            </form>
           </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
