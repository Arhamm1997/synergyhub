import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TaskProgressChart } from "@/components/dashboard/task-progress-chart";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
       <CardHeader className="p-0">
        <CardTitle>Welcome Back, Alex!</CardTitle>
        <CardDescription>Here's a summary of your team's activity.</CardDescription>
      </CardHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCards />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TaskProgressChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTasks />
        </div>
      </div>
    </div>
  );
}
