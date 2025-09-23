import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Activity, Users, Calendar, CheckCircle, Clock, TrendingUp,
    DollarSign, Target, AlertTriangle, Award, Briefcase, UserCheck
} from 'lucide-react';
import { useTasksStore } from '@/store/tasks-store';
import { useProjectsStore } from '@/store/projects-store';
import { useMemberStore } from '@/store/member-store';
import { useClientsStore } from '@/store/clients-store';
import { useAuthStore } from '@/store/auth-store';
import type { Task, Project, Priority, TaskStatus } from '@/lib/types';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface DashboardAnalyticsProps {
    businessId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const priorityColors = {
    'Urgent': '#EF4444',
    'High': '#F97316',
    'Medium': '#EAB308',
    'Low': '#22C55E',
    'None': '#6B7280'
};

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-4 w-4">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
                {trend && (
                    <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
                        {Math.abs(trend.value)}% from last week
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function DashboardAnalytics({ businessId }: DashboardAnalyticsProps) {
    const { tasks, isLoading: tasksLoading, fetchTasks, getTaskAnalytics } = useTasksStore();
    const { projects, isLoading: projectsLoading, fetchProjects, getProjectAnalytics } = useProjectsStore();
    const { members, isLoading: membersLoading, fetchMembers } = useMemberStore();
    const { clients, isLoading: clientsLoading, fetchClients } = useClientsStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (businessId) {
            fetchTasks(businessId);
            fetchProjects(businessId);
            fetchMembers(businessId);
            fetchClients(businessId);
        }
    }, [businessId, fetchTasks, fetchProjects, fetchMembers, fetchClients]);

    // Calculate metrics
    const taskAnalytics = React.useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const overdueTasks = tasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
        ).length;

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Task distribution by status
        const statusDistribution = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'].map(status => ({
            name: status,
            value: tasks.filter(t => t.status === status).length,
            color: COLORS[['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'].indexOf(status)]
        }));

        // Priority distribution
        const priorityDistribution = Object.entries(priorityColors).map(([priority, color]) => ({
            name: priority,
            value: tasks.filter(t => t.priority === priority).length,
            color
        }));

        // Weekly progress
        const weekDays = eachDayOfInterval({
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date())
        });

        const weeklyProgress = weekDays.map(day => ({
            name: format(day, 'EEE'),
            completed: tasks.filter(t =>
                t.completedAt &&
                format(new Date(t.completedAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            ).length,
            created: tasks.filter(t =>
                format(new Date(t.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            ).length
        }));

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            completionRate,
            statusDistribution,
            priorityDistribution,
            weeklyProgress
        };
    }, [tasks]);

    const projectAnalytics = React.useMemo(() => {
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'Active').length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

        const averageProgress = projects.length > 0
            ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
            : 0;

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            totalBudget,
            averageProgress
        };
    }, [projects]);

    const teamAnalytics = React.useMemo(() => {
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.status === 'Active').length;

        // Task distribution by member
        const memberWorkload = members.map(member => {
            const memberTasks = tasks.filter(t => t.assignee?.id === member.user.id);
            const completedTasks = memberTasks.filter(t => t.status === 'Done').length;

            return {
                name: member.user.name,
                activeTasks: memberTasks.filter(t => t.status !== 'Done').length,
                completedTasks,
                avatar: member.user.avatarUrl
            };
        }).filter(m => m.activeTasks > 0 || m.completedTasks > 0);

        return {
            totalMembers,
            activeMembers,
            memberWorkload
        };
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Tasks"
                    value={taskAnalytics.totalTasks}
                    subtitle={`${taskAnalytics.completedTasks} completed`}
                    icon={<CheckCircle className="h-4 w-4" />}
                    trend={{ value: 12, isPositive: true }}
                />
                <MetricCard
                    title="Active Projects"
                    value={projectAnalytics.activeProjects}
                    subtitle={`${projectAnalytics.totalProjects} total projects`}
                    icon={<Briefcase className="h-4 w-4" />}
                    trend={{ value: 8, isPositive: true }}
                />
                <MetricCard
                    title="Team Members"
                    value={teamAnalytics.activeMembers}
                    subtitle={`${teamAnalytics.totalMembers} total members`}
                    icon={<Users className="h-4 w-4" />}
                />
                <MetricCard
                    title="Completion Rate"
                    value={`${taskAnalytics.completionRate.toFixed(1)}%`}
                    subtitle="Task completion rate"
                    icon={<Target className="h-4 w-4" />}
                    trend={{ value: 5, isPositive: true }}
                />
            </div>

            {/* Charts and Analytics */}
            <Tabs defaultValue="tasks" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Task Status Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Status Distribution</CardTitle>
                                <CardDescription>Current task distribution by status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={taskAnalytics.statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {taskAnalytics.statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Priority Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Priority Distribution</CardTitle>
                                <CardDescription>Tasks by priority level</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={taskAnalytics.priorityDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8">
                                                {taskAnalytics.priorityDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overdue Tasks Alert */}
                    {taskAnalytics.overdueTasks > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-700 flex items-center">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    Overdue Tasks Alert
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-red-600">
                                    You have {taskAnalytics.overdueTasks} overdue task(s) that need immediate attention.
                                </p>
                                <Button size="sm" className="mt-2" variant="destructive">
                                    View Overdue Tasks
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Progress</CardTitle>
                                <CardDescription>Overall project completion status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Average Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                            {projectAnalytics.averageProgress.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress value={projectAnalytics.averageProgress} className="h-2" />
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Active: </span>
                                            <span className="font-medium">{projectAnalytics.activeProjects}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Completed: </span>
                                            <span className="font-medium">{projectAnalytics.completedProjects}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Overview</CardTitle>
                                <CardDescription>Total project budget allocation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        ${projectAnalytics.totalBudget.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Total Budget</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Workload</CardTitle>
                            <CardDescription>Task distribution across team members</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamAnalytics.memberWorkload.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant="outline">
                                                {member.activeTasks} active
                                            </Badge>
                                            <Badge variant="secondary">
                                                {member.completedTasks} completed
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Progress</CardTitle>
                            <CardDescription>Task completion and creation trends this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={taskAnalytics.weeklyProgress}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stackId="1"
                                            stroke="#22C55E"
                                            fill="#22C55E"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="created"
                                            stackId="1"
                                            stroke="#3B82F6"
                                            fill="#3B82F6"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}