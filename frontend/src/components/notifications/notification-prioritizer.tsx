"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Loader2,
  AlertCircle,
  ClipboardList as TaskIcon,
  MessageSquare,
  FileText,
  CalendarClock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  prioritizeNotifications,
  type NotificationInput,
  type NotificationOutput,
} from "@/ai/flows/smart-notification-prioritization";

const mockNotifications: NotificationInput['notifications'] = [
  { id: '1', message: 'New task "Design landing page" assigned to you.', type: 'TASK_ASSIGNED', timestamp: new Date(Date.now() - 3600000).toISOString(), relevantEntities: ['landing-page-project'] },
  { id: '2', message: 'Project "Mobile App Redesign" is due tomorrow.', type: 'DEADLINE_APPROACHING', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), relevantEntities: ['mobile-app-redesign'] },
  { id: '3', message: 'Client "Innovate Corp" has sent a new message.', type: 'CLIENT_MESSAGE', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), relevantEntities: ['Innovate Corp'] },
  { id: '4', message: 'Team member "Jane Doe" completed a task.', type: 'TASK_COMPLETED', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), relevantEntities: ['Jane Doe'] },
  { id: '5', message: 'System update scheduled for tonight at 11 PM.', type: 'SYSTEM_ALERT', timestamp: new Date().toISOString(), relevantEntities: ['system'] },
  { id: '6', message: 'Your weekly performance report is ready.', type: 'REPORT_READY', timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const notificationIcons: { [key: string]: React.ElementType } = {
  TASK_ASSIGNED: TaskIcon,
  DEADLINE_APPROACHING: CalendarClock,
  CLIENT_MESSAGE: MessageSquare,
  REPORT_READY: FileText,
  default: AlertCircle,
};


export function NotificationPrioritizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [prioritizedNotifications, setPrioritizedNotifications] = useState<NotificationOutput>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAndPrioritize = () => {
    if (prioritizedNotifications.length > 0) return; // Already fetched

    startTransition(async () => {
      setError(null);
      try {
        const result = await prioritizeNotifications({
          notifications: mockNotifications,
          userRole: "Team Lead",
        });
        setPrioritizedNotifications(result);
      } catch (e) {
        console.error(e);
        setError("Failed to prioritize notifications. Please try again.");
      }
    });
  };

  const getPriorityBadge = (score: number) => {
    if (score > 80) return <Badge variant="destructive">Urgent</Badge>;
    if (score > 60) return <Badge variant="secondary">High</Badge>;
    if (score > 40) return <Badge>Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleFetchAndPrioritize}>
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Smart Notifications</SheetTitle>
          <SheetDescription>
            AI-prioritized updates to keep you focused.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-4">
          {isPending && (
            Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full mt-1" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </div>
            ))
          )}
          {error && <div className="text-destructive text-sm">{error}</div>}
          {!isPending && !error && prioritizedNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || notificationIcons.default;
            return(
              <div key={notification.id} className="flex items-start space-x-4">
                <div className="bg-muted rounded-full p-2 mt-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                    {getPriorityBadge(notification.priorityScore)}
                  </div>
                </div>
              </div>
          )})}
           {!isPending && !error && prioritizedNotifications.length === 0 && (
             <div className="text-center text-muted-foreground py-8">
                <Bell className="mx-auto h-12 w-12" />
                <p>No notifications yet.</p>
             </div>
           )}
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" className="w-full">
            View All Notifications
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
