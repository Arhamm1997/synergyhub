import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar, User } from 'lucide-react';
import { useTasksStore } from '@/store/tasks-store';
import { useAuthStore } from '@/store/auth-store';
import type { Task, TaskStatus, Priority } from '@/lib/types';
import { format } from 'date-fns';

const TASK_STATUSES: TaskStatus[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];

interface KanbanTaskProps {
    task: Task;
    onTaskClick?: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
    'Urgent': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500',
    'None': 'bg-gray-400'
};

const statusColors: Record<TaskStatus, string> = {
    'Backlog': 'bg-gray-100 border-gray-200',
    'Todo': 'bg-blue-50 border-blue-200',
    'In Progress': 'bg-orange-50 border-orange-200',
    'In Review': 'bg-purple-50 border-purple-200',
    'Done': 'bg-green-50 border-green-200',
    'Cancelled': 'bg-red-50 border-red-200'
};

function KanbanTask({ task, onTaskClick }: KanbanTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleClick = () => {
        if (onTaskClick) {
            onTaskClick(task);
        }
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                        {task.title}
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className={`ml-2 h-2 w-2 rounded-full p-0 ${priorityColors[task.priority]} border-0`}
                        title={task.priority}
                    />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {task.assignee && (
                            <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                                    <AvatarFallback className="text-xs">
                                        {task.assignee.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>

                    {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
    return (
        <div className={`flex flex-col min-h-[500px] p-4 rounded-lg border-2 border-dashed ${statusColors[status]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm">{status}</h3>
                    <Badge variant="secondary" className="text-xs">
                        {tasks.length}
                    </Badge>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Plus className="h-3 w-3" />
                </Button>
            </div>

            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2">
                    {tasks.map((task) => (
                        <KanbanTask
                            key={task.id}
                            task={task}
                            onTaskClick={onTaskClick}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

interface TaskKanbanBoardProps {
    businessId?: string;
    projectId?: string;
    onTaskClick?: (task: Task) => void;
}

export function TaskKanbanBoard({ businessId, projectId, onTaskClick }: TaskKanbanBoardProps) {
    const { tasks, isLoading, error, fetchTasks, updateTaskStatus } = useTasksStore();
    const { user } = useAuthStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        if (businessId || projectId) {
            fetchTasks(businessId, projectId);
        }
    }, [businessId, projectId, fetchTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeTask = tasks.find(t => t.id === active.id);
        const overStatus = over.id as TaskStatus;

        if (!activeTask || activeTask.status === overStatus) return;

        try {
            await updateTaskStatus(activeTask.id, overStatus);
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
        acc[status] = tasks.filter(task => task.status === status);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-2">Error loading tasks</p>
                    <p className="text-muted-foreground text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
                    {TASK_STATUSES.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            tasks={tasksByStatus[status]}
                            onTaskClick={onTaskClick}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="transform rotate-3 opacity-90">
                            <KanbanTask task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}