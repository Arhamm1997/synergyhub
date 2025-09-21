import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";

const tasks: Task[] = [
  {
    id: "1",
    title: "Deploy V2 of the marketing website",
    assignee: { name: "Sarah Lee", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageHint! },
    priority: "High",
    status: "In Progress",
    dueDate: "2024-08-15",
  },
  {
    id: "2",
    title: "Fix authentication bug on mobile",
    assignee: { name: "David Chen", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageHint! },
    priority: "High",
    status: "Todo",
    dueDate: "2024-08-10",
  },
  {
    id: "3",
    title: "Design new client onboarding flow",
    assignee: { name: "Maria Rodriguez", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageHint! },
    priority: "Medium",
    status: "In Progress",
    dueDate: "2024-08-25",
  },
   {
    id: "4",
    title: "Write Q3 performance report",
    assignee: { name: "Alex Moran", avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl!, avatarHint: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageHint! },
    priority: "Low",
    status: "Done",
    dueDate: "2024-07-30",
  },
];

const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" } = {
    High: "destructive",
    Medium: "secondary",
    Low: "default"
}

export function RecentTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>An overview of recently updated tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden sm:table-cell">Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground md:hidden">{task.assignee.name}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} data-ai-hint={task.assignee.avatarHint} />
                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant[task.priority]} className="capitalize">{task.priority}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="capitalize">{task.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
