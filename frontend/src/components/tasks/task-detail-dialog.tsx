
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCommentStore } from "@/store/comment-store";
import { useAuthStore } from "@/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useTaskPermissions } from "@/hooks/use-task-permissions";
import {
  MessageSquare,
  Paperclip,
  Send,
  User,
  Calendar,
  Flag,
  CheckCircle,
  AlignLeft,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notification-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";
import { AssigneeSelector } from "./assignee-selector";
import { useMemberStore } from "@/store/member-store";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import placeholderImages from "@/lib/placeholder-images.json";

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
  onDeleteTask: (taskId: string) => void;
}

export function TaskDetailDialog({ open, onOpenChange, task, onUpdateTask, onDeleteTask }: TaskDetailDialogProps) {
  const { toast } = useToast();
  const currentUser = useAuthStore((state) => state.user);
  const [comment, setComment] = useState("");
  const {
    canView,
    canEdit: canEditTask,
    canDelete: canDeleteTask,
    canAssign: canChangeAssignee,
    canReadComments,
    canWriteComments: canAddComment
  } = useTaskPermissions(task.id);

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

  const { members } = useMemberStore();

  const onSubmit = async (values: TaskFormValues) => {
    // Verify permissions before proceeding
    if (!canEditTask && !canChangeAssignee) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this task.",
        variant: "destructive"
      });
      return;
    }

    const assignee = members.find(m => m.name === values.assigneeName);
    if (!assignee) return;

    const isAssigneeChanged = task.assignee.name !== assignee.name;

    // Check specific permission for assignee change
    if (isAssigneeChanged && !canChangeAssignee) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to change the task assignee.",
        variant: "destructive"
      });
      return;
    }

    const updatedTask: Task = {
      ...task,
      ...(canEditTask ? values : {}),
      assignee: canChangeAssignee && isAssigneeChanged ? {
        name: assignee.name,
        avatarUrl: assignee.avatarUrl,
        avatarHint: assignee.avatarHint,
      } : task.assignee,
      dueDate: canEditTask ? format(values.dueDate, "yyyy-MM-dd") : task.dueDate,
      priority: canEditTask ? (values.priority as Priority) : task.priority,
      status: canEditTask ? (values.status as TaskStatus) : task.status
    };

    // Update the task
    onUpdateTask(updatedTask);

    // Send notifications if assignee changed
    if (isAssigneeChanged) {
      useNotificationStore.getState().addNotification({
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned the task "${updatedTask.title}"`,
        data: { taskId: updatedTask.id }
      });
    }

    toast({ title: "Task Updated", description: "The task details have been saved." });
    onOpenChange(false);
  };

  const { comments, addComment } = useCommentStore();
  const taskComments = comments[task.id] || [];

  const handleSendComment = () => {
    if (!canAddComment) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to add comments to this task.",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim() === "") return;

    // Add the comment
    addComment(task.id, "current-user", comment);

    toast({
      title: "Comment Added",
      description: `Your comment has been added to the task.`,
    });
    setComment("");
  }

  const handleDelete = () => {
    if (!canDeleteTask) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete this task.",
        variant: "destructive"
      });
      return;
    }

    onDeleteTask(task.id);
    onOpenChange(false);
    toast({ title: "Task Deleted", description: `Task "${task.title}" has been deleted.` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] grid grid-cols-1 md:grid-cols-3 gap-8 p-0">
        <div className="md:col-span-2 p-6 flex flex-col">
          <DialogHeader className="mb-4 flex-row justify-between items-start">
            <DialogTitle>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    className="text-2xl font-bold border-0 shadow-none -ml-2 focus-visible:ring-0"
                    readOnly={!canEditTask}
                  />
                )}
              />
            </DialogTitle>
            <DialogDescription className="sr-only">
              Edit task details, assign team members, set priorities and track progress.
            </DialogDescription>
            {canDeleteTask && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Comments ({taskComments.length})
              </h3>

              {/* Comments List */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {taskComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                      />
                      <AvatarFallback>{comment.authorName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium mb-1">
                          {comment.authorId}
                        </p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Comment Input */}
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser?.avatarUrl}
                    alt={currentUser?.name || "Current user"}
                  />
                  <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Textarea
                    placeholder={canAddComment ? "Write a comment..." : "You don't have permission to comment"}
                    className="pr-24"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={!canAddComment}
                  />
                  {canAddComment && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSendComment}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-6 rounded-r-lg flex flex-col gap-6 overflow-y-auto">
          <h3 className="font-semibold">Details</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!canEditTask && !canChangeAssignee && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                  You have view-only access to this task.
                </div>
              )}
              <FormField
                control={form.control}
                name="assigneeName"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Assignee</FormLabel>
                    <FormControl>
                      <AssigneeSelector value={field.value} onChange={field.onChange} disabled={!canChangeAssignee} />
                    </FormControl>
                    {!canChangeAssignee && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You don't have permission to change the assignee
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormLabel className="w-24 flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Due Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} disabled={!canEditTask} />
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
                      <Input placeholder="Select status" {...field} readOnly={!canEditTask} />
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
                      <Input placeholder="Select priority" {...field} readOnly={!canEditTask} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!canEditTask && !canChangeAssignee}
              >
                Save Changes
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
