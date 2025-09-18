import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Activity, ListChecks, Users, Briefcase } from "lucide-react";
import type { SummaryStat } from "@/lib/types";

const stats: SummaryStat[] = [
  {
    title: "Active Tasks",
    value: "32",
    description: "+2 from last week",
    icon: ListChecks,
  },
  {
    title: "Projects",
    value: "8",
    description: "1 nearing deadline",
    icon: Briefcase,
  },
  {
    title: "Team Members",
    value: "12",
    description: "2 recently joined",
    icon: Users,
  },
  {
    title: "Productivity",
    value: "92%",
    description: "+5% from last month",
    icon: Activity,
  },
];

export function SummaryCards() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
