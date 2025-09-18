
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

const localizer = momentLocalizer(moment);

interface TaskCalendarViewProps {
  tasks: Task[];
}

const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" } = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};


const EventComponent = ({ event }: { event: any }) => {
    return (
        <div className="flex flex-col text-xs p-1">
            <span className="font-semibold truncate">{event.title}</span>
            <Badge variant={priorityVariant[event.resource.priority]} className="capitalize h-fit w-fit text-white">{event.resource.priority}</Badge>
        </div>
    )
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const events = tasks.map((task) => ({
    title: task.title,
    start: parseISO(task.dueDate),
    end: parseISO(task.dueDate),
    allDay: true,
    resource: task,
  }));

  return (
    <Card className="mt-4">
      <CardContent className="p-2 md:p-4">
        <div className="h-[70vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            components={{
              event: EventComponent
            }}
            eventPropGetter={(event) => {
              const priority = event.resource.priority;
              let className = 'rounded-md p-1 border-l-4 ';
              if(priority === 'High') {
                className += 'bg-destructive/20 border-destructive';
              } else if (priority === 'Medium') {
                className += 'bg-secondary/50 border-secondary-foreground';
              } else {
                 className += 'bg-primary/10 border-primary';
              }
              return {className};
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

    