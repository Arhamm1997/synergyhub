import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Clock, User, MapPin, ExternalLink } from 'lucide-react';
import { useTasksStore } from '@/store/tasks-store';
import { useProjectsStore } from '@/store/projects-store';
import { useAuthStore } from '@/store/auth-store';
import type { Task, Project } from '@/lib/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent extends Event {
    id: string;
    type: 'task' | 'project' | 'milestone' | 'meeting';
    data: Task | Project | any;
    priority?: string;
    status?: string;
    assignee?: any;
}

interface ProjectCalendarProps {
    businessId?: string;
    projectId?: string;
    viewMode?: 'month' | 'week' | 'day' | 'agenda';
}

const eventTypeColors = {
    task: {
        'Urgent': 'bg-red-500 border-red-600',
        'High': 'bg-orange-500 border-orange-600',
        'Medium': 'bg-yellow-500 border-yellow-600',
        'Low': 'bg-green-500 border-green-600',
        'None': 'bg-gray-500 border-gray-600'
    },
    project: 'bg-blue-500 border-blue-600',
    milestone: 'bg-purple-500 border-purple-600',
    meeting: 'bg-teal-500 border-teal-600'
};

const statusColors = {
    'Backlog': 'opacity-50',
    'Todo': 'opacity-70',
    'In Progress': 'opacity-90',
    'In Review': 'opacity-85',
    'Done': 'opacity-40',
    'Cancelled': 'opacity-30'
};

function EventComponent({ event }: { event: CalendarEvent }) {
    const getEventStyle = () => {
        let baseStyle = '';

        if (event.type === 'task') {
            baseStyle = eventTypeColors.task[event.priority as keyof typeof eventTypeColors.task] || eventTypeColors.task.None;
        } else {
            baseStyle = eventTypeColors[event.type];
        }

        if (event.status) {
            const opacity = statusColors[event.status as keyof typeof statusColors] || '';
            baseStyle += ` ${opacity}`;
        }

        return baseStyle;
    };

    return (
        <div className={`text-white text-xs p-1 rounded ${getEventStyle()}`}>
            <div className="font-semibold truncate">{event.title}</div>
            {event.assignee && (
                <div className="flex items-center mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{event.assignee.name}</span>
                </div>
            )}
        </div>
    );
}

function EventDetailModal({ event, isOpen, onClose }: {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!event) return null;

    const formatEventTime = (start: Date, end: Date) => {
        const startTime = format(start, 'MMM d, yyyy h:mm a');
        const endTime = format(end, 'h:mm a');

        if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
            return `${format(start, 'MMM d, yyyy')} ${format(start, 'h:mm a')} - ${endTime}`;
        }
        return `${startTime} - ${format(end, 'MMM d, yyyy h:mm a')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                            {event.type}
                        </Badge>
                        <span>{event.title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatEventTime(event.start as Date, event.end as Date)}</span>
                    </div>

                    {event.assignee && (
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={event.assignee.avatarUrl} alt={event.assignee.name} />
                                <AvatarFallback className="text-xs">
                                    {event.assignee.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{event.assignee.name}</span>
                        </div>
                    )}

                    {event.type === 'task' && event.data.description && (
                        <div>
                            <h4 className="font-medium text-sm mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">{event.data.description}</p>
                        </div>
                    )}

                    {event.priority && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Priority:</span>
                            <Badge variant="outline" className={`${eventTypeColors.task[event.priority as keyof typeof eventTypeColors.task]} text-white border-0`}>
                                {event.priority}
                            </Badge>
                        </div>
                    )}

                    {event.status && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Status:</span>
                            <Badge variant="outline">{event.status}</Badge>
                        </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                        </Button>
                        {event.type === 'task' && (
                            <Button size="sm" className="flex-1">
                                Edit Task
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ProjectCalendar({ businessId, projectId, viewMode = 'month' }: ProjectCalendarProps) {
    const { tasks, isLoading: tasksLoading, fetchTasks } = useTasksStore();
    const { projects, isLoading: projectsLoading, fetchProjects } = useProjectsStore();
    const { user } = useAuthStore();

    const [currentView, setCurrentView] = useState<View>(viewMode);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (businessId || projectId) {
            fetchTasks(businessId, projectId);
            if (businessId) {
                fetchProjects(businessId);
            }
        }
    }, [businessId, projectId, fetchTasks, fetchProjects]);

    const events: CalendarEvent[] = React.useMemo(() => {
        const calendarEvents: CalendarEvent[] = [];

        // Add tasks with due dates
        tasks.forEach(task => {
            if (task.dueDate) {
                const start = new Date(task.dueDate);
                const end = new Date(task.dueDate);
                end.setHours(23, 59, 59); // End of day for due date

                calendarEvents.push({
                    id: `task-${task.id}`,
                    title: task.title,
                    start,
                    end,
                    type: 'task',
                    data: task,
                    priority: task.priority,
                    status: task.status,
                    assignee: task.assignee
                });
            }
        });

        // Add project deadlines
        projects.forEach(project => {
            if (project.deadline) {
                const start = new Date(project.deadline);
                const end = new Date(project.deadline);
                end.setHours(23, 59, 59);

                calendarEvents.push({
                    id: `project-${project.id}`,
                    title: `${project.name} Deadline`,
                    start,
                    end,
                    type: 'project',
                    data: project,
                    status: project.status
                });
            }

            // Add project milestones
            if (project.milestones) {
                project.milestones.forEach((milestone, index) => {
                    if (milestone.dueDate) {
                        const start = new Date(milestone.dueDate);
                        const end = new Date(milestone.dueDate);
                        end.setHours(23, 59, 59);

                        calendarEvents.push({
                            id: `milestone-${project.id}-${index}`,
                            title: milestone.title,
                            start,
                            end,
                            type: 'milestone',
                            data: milestone,
                            status: milestone.completed ? 'Done' : 'In Progress'
                        });
                    }
                });
            }
        });

        return calendarEvents;
    }, [tasks, projects]);

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const handleCloseModal = () => {
        setShowEventModal(false);
        setSelectedEvent(null);
    };

    const isLoading = tasksLoading || projectsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <Card className="h-full">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <CalendarDays className="h-5 w-5" />
                            <span>Project Calendar</span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant={currentView === 'month' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('month')}
                            >
                                Month
                            </Button>
                            <Button
                                size="sm"
                                variant={currentView === 'week' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('week')}
                            >
                                Week
                            </Button>
                            <Button
                                size="sm"
                                variant={currentView === 'day' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('day')}
                            >
                                Day
                            </Button>
                            <Button
                                size="sm"
                                variant={currentView === 'agenda' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('agenda')}
                            >
                                Agenda
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-120px)]">
                    <div className="h-full">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            view={currentView}
                            onView={setCurrentView}
                            date={currentDate}
                            onNavigate={setCurrentDate}
                            onSelectEvent={handleSelectEvent}
                            components={{
                                event: EventComponent,
                            }}
                            eventPropGetter={(event: CalendarEvent) => ({
                                className: 'cursor-pointer hover:shadow-lg transition-shadow'
                            })}
                            popup
                            showMultiDayTimes
                            step={60}
                            showAllEvents
                        />
                    </div>
                </CardContent>
            </Card>

            <EventDetailModal
                event={selectedEvent}
                isOpen={showEventModal}
                onClose={handleCloseModal}
            />
        </div>
    );
}