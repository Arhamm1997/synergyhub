import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TaskProgressChart } from "@/components/dashboard/task-progress-chart";
import { RecentTasks } from "@/components/dashboard/recent-tasks";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
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
