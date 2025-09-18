
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar, momentLocalizer, EventProps, ToolbarProps, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, CalendarEvent } from "@/lib/types";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CreateEventDialog } from "./create-event-dialog";

const localizer = momentLocalizer(moment);

interface TaskCalendarViewProps {
  tasks: Task[];
  onEventClick: (task: Task) => void;
}

const priorityVariant: { [key in Task["priority"]]: "destructive" | "secondary" | "default" | "outline" } = {
  Urgent: "destructive",
  High: "destructive",
  Medium: "secondary",
  Low: "default",
  None: "outline",
};

const CustomToolbar = (toolbar: ToolbarProps) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = moment(toolbar.date);
        return (
            <span>
                <span className="font-bold text-xl">{date.format('MMMM')}</span>
                <span className="text-xl"> {date.format('YYYY')}</span>
            </span>
        );
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToCurrent}>Today</Button>
                 <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
                 </div>
            </div>
            <div className="text-center">
                {label()}
            </div>
             <div className="flex items-center gap-2">
                {toolbar.views.map(view => (
                     <Button 
                        key={view}
                        variant={toolbar.view === view ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => toolbar.onView(view as any)}
                        className="capitalize"
                    >
                        {view}
                    </Button>
                ))}
            </div>
        </div>
    );
};


const EventComponent = ({ event }: EventProps<any>) => {
  if (event.isTask) {
    // Task rendering
    return (
      <div className="flex flex-col text-xs p-1 h-full overflow-hidden">
        <span className="font-semibold truncate text-foreground">{event.title}</span>
        <span className="text-muted-foreground truncate">{event.assignee.name}</span>
        <div className="flex-grow" />
        <Badge
          variant={priorityVariant[event.priority]}
          className={cn("capitalize h-fit w-fit",
            event.priority === "Urgent" && "bg-red-500/20 text-red-700 border-red-500/20",
            event.priority === "High" && "bg-amber-500/20 text-amber-700 border-amber-500/20",
            event.priority === "Medium" && "bg-sky-500/20 text-sky-700 border-sky-500/20",
            event.priority === "Low" && "bg-green-500/20 text-green-700 border-green-500/20",
          )}
        >
          {event.priority}
        </Badge>
      </div>
    );
  }

  // Generic event rendering
  return (
    <div className="flex flex-col text-xs p-1 h-full overflow-hidden">
      <span className="font-semibold truncate text-foreground">{event.title}</span>
    </div>
  );
};

export function TaskCalendarView({ tasks, onEventClick }: TaskCalendarViewProps) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = React.useState(false);
  const [slotInfo, setSlotInfo] = React.useState<SlotInfo | null>(null);
  
  React.useEffect(() => {
     const taskEvents = tasks.map((task) => ({
        ...task,
        start: parseISO(task.dueDate),
        end: parseISO(task.dueDate),
        allDay: true,
        isTask: true,
      }));
    setEvents(prev => [...taskEvents, ...prev.filter(e => !e.isTask)]);
  }, [tasks]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setIsEventDialogOpen(true);
    setSlotInfo(slotInfo);
  }

  const handleCreateEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
        id: `EVT-${Date.now()}`,
        ...event,
        isTask: false,
    };
    setEvents(prev => [...prev, newEvent]);
  }
  
  const handleEventClick = (event: any) => {
      if (event.isTask) {
          onEventClick(event);
      }
      // Can add logic here to open a detail view for non-task events as well
  }


  return (
    <>
    <Card className="mt-4">
      <CardContent className="p-2 md:p-4">
        <div className="h-[70vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            selectable
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent
            }}
            eventPropGetter={(event) => {
              if (event.isTask) {
                  const priority = event.priority;
                  let className = 'rounded-md p-0.5 border-l-4 cursor-pointer text-foreground ';
                  if(priority === 'Urgent') {
                    className += 'bg-red-500/10 border-red-500';
                  } else if (priority === 'High') {
                    className += 'bg-amber-500/10 border-amber-500';
                  } else if (priority === 'Medium') {
                    className += 'bg-sky-500/10 border-sky-500';
                  } else {
                    className += 'bg-green-500/10 border-green-500';
                  }
                  return {className};
              }
              // Default styling for non-task events
              return {
                className: 'rounded-md p-0.5 border-l-4 cursor-pointer text-foreground bg-indigo-500/10 border-indigo-500'
              }
            }}
             formats={{
                dayFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'ddd D', culture) : '',
                weekdayFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'dddd', culture) : '',
                monthHeaderFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'MMMM YYYY', culture) : '',
                dayHeaderFormat: (date, culture, localizer) => localizer ? localizer.format(date, 'dddd, MMMM Do', culture) : '',
            }}
             className="[&_.rbc-toolbar]:mb-4 [&_.rbc-header]:border-b-2 [&_.rbc-header]:p-2 [&_.rbc-header]:font-bold [&_.rbc-day-bg]:border-l [&_.rbc-month-view]:border-0 [&_.rbc-month-row]:border-t [&_.rbc-event]:bg-transparent [&_.rbc-event]:p-0"
          />
        </div>
      </CardContent>
    </Card>
     <CreateEventDialog 
        isOpen={isEventDialogOpen} 
        onOpenChange={setIsEventDialogOpen}
        onCreate={handleCreateEvent}
        slotInfo={slotInfo}
      />
    </>
  );
}

    