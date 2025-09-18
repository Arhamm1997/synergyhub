
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, momentLocalizer, EventProps } from "react-big-calendar";
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


const EventComponent = ({ event }: EventProps<Task & { title: string }>) => {
    return (
        <div className="flex flex-col text-xs p-1 h-full">
            <span className="font-semibold truncate text-foreground">{event.title}</span>
            <span className="text-muted-foreground">{event.assignee.name}</span>
            <div className="flex-grow" />
            <Badge variant={priorityVariant[event.priority]} className="capitalize h-fit w-fit">
                {event.priority}
            </Badge>
        </div>
    )
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const events = tasks.map((task) => ({
    ...task,
    start: parseISO(task.dueDate),
    end: parseISO(task.dueDate),
    allDay: true,
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
              const priority = event.priority;
              let className = 'rounded-lg p-2 border-l-4 ';
              if(priority === 'High') {
                className += 'bg-destructive/10 border-destructive text-destructive-foreground';
              } else if (priority === 'Medium') {
                className += 'bg-yellow-500/10 border-yellow-500 text-yellow-foreground';
              } else {
                 className += 'bg-primary/10 border-primary text-primary-foreground';
              }
              return {className};
            }}
             formats={{
                dayFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'ddd D', culture) : '',
                weekdayFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'dddd', culture) : '',
                monthHeaderFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'MMMM YYYY', culture) : '',
                dayHeaderFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'dddd, MMMM Do', culture) : '',
            }}
             className="[&_.rbc-toolbar]:mb-4 [&_.rbc-toolbar_.rbc-toolbar-label]:text-xl [&_.rbc-toolbar_button]:!bg-card [&_.rbc-toolbar_button]:text-card-foreground [&_.rbc-toolbar_button:hover]:!bg-muted [&_.rbc-toolbar_button:focus]:!bg-muted [&_.rbc-btn-group_.rbc-active]:!bg-primary [&_.rbc-btn-group_.rbc-active]:text-primary-foreground [&_.rbc-header]:border-b-2 [&_.rbc-header]:p-2 [&_.rbc-header]:font-bold [&_.rbc-day-bg]:border-l [&_.rbc-month-view]:border-0 [&_.rbc-month-row]:border-t [&_.rbc-event]:bg-transparent [&_.rbc-event]:p-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
