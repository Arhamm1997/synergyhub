'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskKanbanBoard } from '@/components/kanban/task-kanban-board';
import { ProjectCalendar } from '@/components/calendar/project-calendar';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import {
    Plus, Search, Filter, Calendar as CalendarIcon, KanbanSquare,
    BarChart3, Clock, User, Tag, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useTasksStore } from '@/store/tasks-store';
import { useProjectsStore } from '@/store/projects-store';
import { useMemberStore } from '@/store/member-store';
import { useAuthStore } from '@/store/auth-store';
import type { Task, TaskStatus, Priority } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskManagementPageProps {
    businessId: string;
    projectId?: string;
}

interface CreateTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    projectId?: string;
}

function CreateTaskDialog({ isOpen, onClose, businessId, projectId }: CreateTaskDialogProps) {
    const { createTask, isLoading } = useTasksStore();
    const { projects } = useProjectsStore();
    const { members } = useMemberStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium' as Priority,
        status: 'Todo' as TaskStatus,
        assigneeId: '',
        projectId: projectId || '',
        dueDate: undefined as Date | undefined,
        estimatedHours: 0,
        tags: [] as string[]
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createTask(businessId, {
                ...formData,
                dueDate: formData.dueDate?.toISOString(),
                assignee: formData.assigneeId ? members.find(m => m.user.id === formData.assigneeId)?.user : undefined
            });

            onClose();
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'Todo',
                assigneeId: '',
                projectId: projectId || '',
                dueDate: undefined,
                estimatedHours: 0,
                tags: []
            });
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Select
                                value={formData.projectId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignee">Assignee</Label>
                            <Select
                                value={formData.assigneeId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map(member => (
                                        <SelectItem key={member.user.id} value={member.user.id}>
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>{member.user.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.dueDate}
                                        onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedHours">Estimated Hours</Label>
                            <Input
                                id="estimatedHours"
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                    {tag} ×
                                </Badge>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button type="button" onClick={addTag} size="sm">
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function TaskManagementPage({ businessId, projectId }: TaskManagementPageProps) {
    const { tasks, isLoading, error, fetchTasks } = useTasksStore();
    const { projects, fetchProjects } = useProjectsStore();
    const { members, fetchMembers } = useMemberStore();
    const { user } = useAuthStore();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
    const [activeTab, setActiveTab] = useState('kanban');

    useEffect(() => {
        if (businessId) {
            fetchTasks(businessId, projectId);
            fetchProjects(businessId);
            fetchMembers(businessId);
        }
    }, [businessId, projectId, fetchTasks, fetchProjects, fetchMembers]);

    const filteredTasks = React.useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
            const matchesAssignee = assigneeFilter === 'All' || task.assignee?.id === assigneeFilter;

            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
        });
    }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

    const taskStats = React.useMemo(() => {
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(t => t.status === 'Done').length;
        const inProgress = filteredTasks.filter(t => t.status === 'In Progress').length;
        const overdue = filteredTasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
        ).length;

        return { total, completed, inProgress, overdue };
    }, [filteredTasks]);

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Task Management</h1>
                    <p className="text-muted-foreground">
                        Manage and track your team's tasks efficiently
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Tasks</p>
                                <p className="text-2xl font-bold">{taskStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{taskStats.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-bold">{taskStats.overdue}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value: TaskStatus | 'All') => setStatusFilter(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Backlog">Backlog</SelectItem>
                                <SelectItem value="Todo">Todo</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="In Review">In Review</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={(value: Priority | 'All') => setPriorityFilter(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Priority</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Assignees</SelectItem>
                                {members.map(member => (
                                    <SelectItem key={member.user.id} value={member.user.id}>
                                        {member.user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('All');
                                setPriorityFilter('All');
                                setAssigneeFilter('All');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="kanban" className="flex items-center space-x-2">
                        <KanbanSquare className="h-4 w-4" />
                        <span>Kanban Board</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Calendar View</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban" className="mt-6">
                    <Card className="h-[600px]">
                        <CardContent className="p-6 h-full">
                            <TaskKanbanBoard
                                businessId={businessId}
                                projectId={projectId}
                                onTaskClick={(task) => {
                                    // Handle task click - could open task details modal
                                    console.log('Task clicked:', task);
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                    <div className="h-[600px]">
                        <ProjectCalendar
                            businessId={businessId}
                            projectId={projectId}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <DashboardAnalytics businessId={businessId} />
                </TabsContent>
            </Tabs>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                businessId={businessId}
                projectId={projectId}
            />
        </div>
    );
}