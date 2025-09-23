'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProjectCalendar } from '@/components/calendar/project-calendar';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import {
    Plus, Search, Filter, Calendar as CalendarIcon, BarChart3, Users,
    DollarSign, Target, Clock, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';
import { useProjectsStore } from '@/store/projects-store';
import { useTasksStore } from '@/store/tasks-store';
import { useMemberStore } from '@/store/member-store';
import { useClientsStore } from '@/store/clients-store';
import { useAuthStore } from '@/store/auth-store';
import type { Project, ProjectStatus } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectManagementPageProps {
    businessId: string;
}

interface CreateProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
}

function CreateProjectDialog({ isOpen, onClose, businessId }: CreateProjectDialogProps) {
    const { createProject, isLoading } = useProjectsStore();
    const { clients } = useClientsStore();
    const { members } = useMemberStore();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Planning' as ProjectStatus,
        budget: 0,
        clientId: '',
        managerId: '',
        deadline: undefined as Date | undefined,
        tags: [] as string[]
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createProject(businessId, {
                ...formData,
                deadline: formData.deadline?.toISOString(),
                client: formData.clientId ? clients.find(c => c.id === formData.clientId) : undefined,
                manager: formData.managerId ? members.find(m => m.user.id === formData.managerId)?.user : undefined
            });

            onClose();
            setFormData({
                name: '',
                description: '',
                status: 'Planning',
                budget: 0,
                clientId: '',
                managerId: '',
                deadline: undefined,
                tags: []
            });
        } catch (error) {
            console.error('Failed to create project:', error);
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
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ProjectStatus) => setFormData(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planning">Planning</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                            placeholder="Enter project description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="client">Client</Label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manager">Project Manager</Label>
                            <Select
                                value={formData.managerId}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, managerId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select manager" />
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
                            <Label>Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.deadline && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.deadline}
                                        onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
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
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ProjectCardProps {
    project: Project;
    onProjectClick: (project: Project) => void;
}

function ProjectCard({ project, onProjectClick }: ProjectCardProps) {
    const statusColors = {
        'Planning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Active': 'bg-green-100 text-green-800 border-green-200',
        'On Hold': 'bg-orange-100 text-orange-800 border-orange-200',
        'Completed': 'bg-blue-100 text-blue-800 border-blue-200',
        'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onProjectClick(project)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                        {project.name}
                    </CardTitle>
                    <Badge className={statusColors[project.status]}>
                        {project.status}
                    </Badge>
                </div>
                {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.budget && (
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>${project.budget.toLocaleString()}</span>
                        </div>
                    )}

                    {project.deadline && (
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {project.manager && (
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={project.manager.avatarUrl} alt={project.manager.name} />
                                <AvatarFallback className="text-xs">
                                    {project.manager.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{project.manager.name}</span>
                        </div>
                    )}

                    {project.team && (
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{project.team.length}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProjectManagementPage({ businessId }: ProjectManagementPageProps) {
    const { projects, isLoading, error, fetchProjects } = useProjectsStore();
    const { tasks, fetchTasks } = useTasksStore();
    const { members, fetchMembers } = useMemberStore();
    const { clients, fetchClients } = useClientsStore();
    const { user } = useAuthStore();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        if (businessId) {
            fetchProjects(businessId);
            fetchTasks(businessId);
            fetchMembers(businessId);
            fetchClients(businessId);
        }
    }, [businessId, fetchProjects, fetchTasks, fetchMembers, fetchClients]);

    const filteredProjects = React.useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || project.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchQuery, statusFilter]);

    const projectStats = React.useMemo(() => {
        const total = projects.length;
        const active = projects.filter(p => p.status === 'Active').length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const averageProgress = projects.length > 0
            ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
            : 0;

        return { total, active, completed, totalBudget, averageProgress };
    }, [projects]);

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        // Navigate to project details or open modal
        console.log('Project clicked:', project);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Project Management</h1>
                    <p className="text-muted-foreground">
                        Organize and track your projects from start to finish
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Projects</p>
                                <p className="text-2xl font-bold">{projectStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{projectStats.active}</p>
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
                                <p className="text-2xl font-bold">{projectStats.completed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Budget</p>
                                <p className="text-2xl font-bold">${projectStats.totalBudget.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Projects Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Timeline View</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                <Select value={statusFilter} onValueChange={(value: ProjectStatus | 'All') => setStatusFilter(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Status</SelectItem>
                                        <SelectItem value="Planning">Planning</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('All');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onProjectClick={handleProjectClick}
                            />
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">No projects found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery || statusFilter !== 'All'
                                        ? 'Try adjusting your filters to see more projects.'
                                        : 'Get started by creating your first project.'
                                    }
                                </p>
                                {(!searchQuery && statusFilter === 'All') && (
                                    <Button onClick={() => setShowCreateDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Project
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                    <div className="h-[600px]">
                        <ProjectCalendar businessId={businessId} />
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <DashboardAnalytics businessId={businessId} />
                </TabsContent>
            </Tabs>

            {/* Create Project Dialog */}
            <CreateProjectDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                businessId={businessId}
            />
        </div>
    );
}