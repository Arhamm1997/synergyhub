import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Organize, assign, and track all your team's tasks from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A comprehensive task management interface will be available here soon, allowing for creation, filtering, and status updates.</p>
      </CardContent>
    </Card>
  );
}
