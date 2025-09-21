
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TaskProgressChart } from "@/components/dashboard/task-progress-chart";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold">Welcome Back, Alex!</h1>
            <p className="text-muted-foreground">Here's a summary of your team's activity.</p>
         </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCards />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
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
