"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", completed: 186, pending: 80 },
  { month: "February", completed: 305, pending: 200 },
  { month: "March", completed: 237, pending: 120 },
  { month: "April", completed: 73, pending: 190 },
  { month: "May", completed: 209, pending: 130 },
  { month: "June", completed: 214, pending: 140 },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
};

export function TaskProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} accessibilityLayer>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
               <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
              <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
