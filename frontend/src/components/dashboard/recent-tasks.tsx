"use client";

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
import { useTasksStore } from "@/store/tasks-store";
import { useEffect } from "react";

const EmptyState = () => (
  <TableRow>
    <TableCell colSpan={4} className="text-center py-6">
      <div className="text-muted-foreground">No recent tasks found</div>
    </TableCell>
  </TableRow>
);

const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" } = {
  High: "destructive",
  Medium: "secondary",
  Low: "default"
}

export function RecentTasks() {
  const { tasks, isLoading, error, fetchTasks } = useTasksStore();

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <div className="animate-pulse">Loading tasks...</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <div className="text-destructive">{error}</div>
                </TableCell>
              </TableRow>
            ) : !safeTasks || safeTasks.length === 0 ? (
              <EmptyState />
            ) : (
              safeTasks.map((task) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
