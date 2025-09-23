'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { TaskKanbanBoard } from '@/components/kanban/task-kanban-board';
import { ProjectCalendar } from '@/components/calendar/project-calendar';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import {
    BarChart3, Users, Calendar, CheckCircle, Clock, TrendingUp,
    DollarSign, Target, AlertTriangle, Award, Briefcase, UserCheck,
    Plus, ArrowRight, Activity, Star
} from 'lucide-react';
import { useTasksStore } from '@/store/tasks-store';
import { useProjectsStore } from '@/store/projects-store';
import { useMemberStore } from '@/store/member-store';
import { useClientsStore } from '@/store/clients-store';
import { useBusinessesStore } from '@/store/businesses-store';
import { useAuthStore } from '@/store/auth-store';
import type { Task, Project } from '@/lib/types';
import { format, isThisWeek, isToday, addDays } from 'date-fns';
import Link from 'next/link';

interface BusinessDashboardContentProps {
    businessId: string;
}

function BusinessDashboardContent({ businessId }: BusinessDashboardContentProps) {
    const searchParams = useSearchParams();
    const { businesses, fetchBusiness } = useBusinessesStore();
    const { tasks, isLoading: tasksLoading, fetchTasks } = useTasksStore();
    const { projects, isLoading: projectsLoading, fetchProjects } = useProjectsStore();
    const { members, isLoading: membersLoading, fetchMembers } = useMemberStore();
    const { clients, isLoading: clientsLoading, fetchClients } = useClientsStore();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    const currentBusiness = businesses.find(b => b.id === businessId);

    useEffect(() => {
        if (businessId) {
            fetchBusiness(businessId);
            fetchTasks(businessId);
            fetchProjects(businessId);
            fetchMembers(businessId);
            fetchClients(businessId);
        }
    }, [businessId, fetchBusiness, fetchTasks, fetchProjects, fetchMembers, fetchClients]);

    // Dashboard metrics
    const dashboardMetrics = React.useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const overdueTasks = tasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
        ).length;

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'Active').length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const averageProjectProgress = projects.length > 0
            ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
            : 0;

        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Recent activity
        const recentTasks = tasks
            .filter(t => isThisWeek(new Date(t.createdAt)))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        const upcomingDeadlines = tasks
            .filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && new Date(t.dueDate) <= addDays(new Date(), 7))
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            totalProjects,
            activeProjects,
            completedProjects,
            totalBudget,
            averageProjectProgress,
            taskCompletionRate,
            recentTasks,
            upcomingDeadlines
        };
    }, [tasks, projects]);

    const teamPerformance = React.useMemo(() => {
        return members.map(member => {
            const memberTasks = tasks.filter(t => t.assignee?.id === member.user.id);
            const completedTasks = memberTasks.filter(t => t.status === 'Done').length;
            const totalAssigned = memberTasks.length;
            const completionRate = totalAssigned > 0 ? (completedTasks / totalAssigned) * 100 : 0;

            return {
                ...member,
                totalAssigned,
                completedTasks,
                completionRate,
                activeTasks: memberTasks.filter(t => t.status !== 'Done').length
            };
        }).sort((a, b) => b.completionRate - a.completionRate);
    }, [members, tasks]);

    const isLoading = tasksLoading || projectsLoading || membersLoading || clientsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{currentBusiness?.name || 'Business'} Dashboard</h1>
                    <p className="text-muted-foreground">
                        {currentBusiness?.description || 'Welcome to your business management hub'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/dashboard/businesses/${businessId}/tasks`}>
                        <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            New Task
                        </Button>
                    </Link>
                    <Link href={`/dashboard/businesses/${businessId}/projects`}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Task Completion</p>
                                <p className="text-2xl font-bold">{dashboardMetrics.taskCompletionRate.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardMetrics.completedTasks} of {dashboardMetrics.totalTasks} tasks
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Active Projects</p>
                                <p className="text-2xl font-bold">{dashboardMetrics.activeProjects}</p>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardMetrics.averageProjectProgress.toFixed(1)}% avg progress
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                                <p className="text-2xl font-bold">{members.length}</p>
                                <p className="text-xs text-muted-foreground">
                                    {members.filter(m => m.status === 'Active').length} active
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Budget</p>
                                <p className="text-2xl font-bold">${dashboardMetrics.totalBudget.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardMetrics.totalProjects} projects
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Alerts */}
            {(dashboardMetrics.overdueTasks > 0 || dashboardMetrics.upcomingDeadlines.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dashboardMetrics.overdueTasks > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-red-700 flex items-center text-sm">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Overdue Tasks ({dashboardMetrics.overdueTasks})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-600 text-sm mb-3">
                                    You have {dashboardMetrics.overdueTasks} overdue task(s) that need immediate attention.
                                </p>
                                <Link href={`/dashboard/businesses/${businessId}/tasks`}>
                                    <Button size="sm" variant="destructive">
                                        View Overdue Tasks
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {dashboardMetrics.upcomingDeadlines.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-yellow-700 flex items-center text-sm">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Upcoming Deadlines
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {dashboardMetrics.upcomingDeadlines.slice(0, 3).map(task => (
                                        <div key={task.id} className="flex items-center justify-between text-sm">
                                            <span className="font-medium truncate">{task.title}</span>
                                            <span className="text-yellow-600">
                                                {format(new Date(task.dueDate!), 'MMM d')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Link href={`/dashboard/businesses/${businessId}/tasks`}>
                                    <Button size="sm" variant="outline" className="mt-3 w-full">
                                        View All Tasks
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Kanban</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span className="hidden sm:inline">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Team</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Recent Tasks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dashboardMetrics.recentTasks.length > 0 ? (
                                        dashboardMetrics.recentTasks.map(task => (
                                            <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{task.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Created {format(new Date(task.createdAt), 'MMM d')}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {task.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No recent tasks this week</p>
                                    )}
                                </div>
                                <Link href={`/dashboard/businesses/${businessId}/tasks`}>
                                    <Button variant="outline" size="sm" className="w-full mt-3">
                                        View All Tasks
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Project Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Project Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {projects.slice(0, 4).map(project => (
                                        <div key={project.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{project.name}</span>
                                                <span className="text-sm text-muted-foreground">{project.progress || 0}%</span>
                                            </div>
                                            <Progress value={project.progress || 0} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                                <Link href={`/dashboard/businesses/${businessId}/projects`}>
                                    <Button variant="outline" size="sm" className="w-full mt-3">
                                        View All Projects
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-6">
                    <Card className="h-[600px]">
                        <CardContent className="p-6 h-full">
                            <TaskKanbanBoard
                                businessId={businessId}
                                onTaskClick={(task) => {
                                    console.log('Task clicked:', task);
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                    <div className="h-[600px]">
                        <ProjectCalendar businessId={businessId} />
                    </div>
                </TabsContent>

                <TabsContent value="team" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Team Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamPerformance.map((member, index) => (
                                    <div key={member.user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                                                    <AvatarFallback>
                                                        {member.user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                                        <Star className="h-2 w-2 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.user.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <p className="text-sm font-medium">{member.activeTasks}</p>
                                                <p className="text-xs text-muted-foreground">Active</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">{member.completedTasks}</p>
                                                <p className="text-xs text-muted-foreground">Completed</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">{member.completionRate.toFixed(1)}%</p>
                                                <p className="text-xs text-muted-foreground">Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <DashboardAnalytics businessId={businessId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function BusinessDashboard() {
    const params = useParams();
    const businessId = params.businessId as string;

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        }>
            <BusinessDashboardContent businessId={businessId} />
        </Suspense>
    );
}