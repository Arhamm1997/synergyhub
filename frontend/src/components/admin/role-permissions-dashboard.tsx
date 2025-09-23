'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Shield, Users, Settings, Database, Activity,
    UserCheck, Crown, Lock, Key, BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Role } from '@/lib/types';

interface RoleBasedAccessProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

function RoleBasedAccess({ children, allowedRoles }: RoleBasedAccessProps) {
    const { user } = useAuthStore();

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}

interface PermissionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    allowedRoles: Role[];
    actions?: React.ReactNode;
}

function PermissionCard({ title, description, icon, allowedRoles, actions }: PermissionCardProps) {
    const { user } = useAuthStore();
    const hasAccess = user && allowedRoles.includes(user.role);

    return (
        <Card className={`${hasAccess ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {icon}
                        <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    </div>
                    {hasAccess ? (
                        <Badge variant="default" className="bg-green-500">
                            <Key className="h-3 w-3 mr-1" />
                            Access
                        </Badge>
                    ) : (
                        <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            Restricted
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                    {allowedRoles.map(role => (
                        <Badge key={role} variant="outline" className="text-xs">
                            {role === Role.SuperAdmin ? 'Super Admin' : role === Role.Admin ? 'Admin' : role === Role.Member ? 'Member' : 'Client'}
                        </Badge>
                    ))}
                </div>
                {hasAccess && actions && (
                    <div className="flex space-x-2">
                        {actions}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function RolePermissionsDashboard() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Please log in to view permissions</p>
                </CardContent>
            </Card>
        );
    }

    const getRoleIcon = (role: Role) => {
        switch (role) {
            case Role.SuperAdmin:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case Role.Admin:
                return <Shield className="h-5 w-5 text-blue-500" />;
            default:
                return <UserCheck className="h-5 w-5 text-green-500" />;
        }
    };

    const getRoleDescription = (role: Role) => {
        switch (role) {
            case Role.SuperAdmin:
                return 'Complete system access with ability to manage all businesses and admin accounts';
            case Role.Admin:
                return 'Full business management access with ability to manage teams and projects';
            default:
                return 'Standard access to assigned tasks and projects with collaboration features';
        }
    };

    return (
        <div className="space-y-6">
            {/* User Role Status */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        {getRoleIcon(user.role)}
                        <div>
                            <CardTitle className="flex items-center space-x-2">
                                <span>Your Access Level</span>
                                <Badge variant="default" className="bg-blue-500">
                                    {user.role === Role.SuperAdmin ? 'Super Admin' : user.role === Role.Admin ? 'Admin' : 'Employee'}
                                </Badge>
                            </CardTitle>
                            <CardDescription>{getRoleDescription(user.role)}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Account Type:</span>
                            <p className="text-muted-foreground">
                                {user.role === Role.SuperAdmin ? 'Super Administrator' :
                                    user.role === Role.Admin ? 'Administrator (1 of 20 max)' :
                                        'Employee (Unlimited)'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Access Scope:</span>
                            <p className="text-muted-foreground">
                                {user.role === Role.SuperAdmin ? 'System-wide' :
                                    user.role === Role.Admin ? 'Business-wide' :
                                        'Project-specific'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Management Rights:</span>
                            <p className="text-muted-foreground">
                                {user.role === Role.SuperAdmin ? 'All users & businesses' :
                                    user.role === Role.Admin ? 'Team members & projects' :
                                        'Own tasks & collaboration'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permission Matrix */}
            <div>
                <h3 className="text-lg font-semibold mb-4">System Permissions Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <PermissionCard
                        title="User Management"
                        description="Create, edit, and manage user accounts and roles"
                        icon={<Users className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin, Role.Admin]}
                        actions={
                            <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin]}>
                                <Button size="sm" variant="outline">Manage Users</Button>
                            </RoleBasedAccess>
                        }
                    />

                    <PermissionCard
                        title="Business Management"
                        description="Create and manage business settings, policies, and configurations"
                        icon={<Settings className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin, Role.Admin]}
                        actions={
                            <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin]}>
                                <Button size="sm" variant="outline">Business Settings</Button>
                            </RoleBasedAccess>
                        }
                    />

                    <PermissionCard
                        title="System Administration"
                        description="Access system logs, analytics, and administrative functions"
                        icon={<Database className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin]}
                        actions={
                            <RoleBasedAccess allowedRoles={[Role.SuperAdmin]}>
                                <Button size="sm" variant="outline">System Admin</Button>
                            </RoleBasedAccess>
                        }
                    />

                    <PermissionCard
                        title="Project Management"
                        description="Create, manage, and oversee projects and timelines"
                        icon={<Activity className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin, Role.Admin, Role.Member]}
                        actions={
                            <>
                                <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin]}>
                                    <Button size="sm" variant="outline">Create Project</Button>
                                </RoleBasedAccess>
                                <RoleBasedAccess allowedRoles={[Role.Member]}>
                                    <Button size="sm" variant="outline">View Projects</Button>
                                </RoleBasedAccess>
                            </>
                        }
                    />

                    <PermissionCard
                        title="Team Collaboration"
                        description="Participate in team discussions, share files, and collaborate"
                        icon={<UserCheck className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin, Role.Admin, Role.Member]}
                        actions={
                            <Button size="sm" variant="outline">Collaborate</Button>
                        }
                    />

                    <PermissionCard
                        title="Advanced Analytics"
                        description="Access detailed reports, metrics, and business intelligence"
                        icon={<BarChart3 className="h-4 w-4" />}
                        allowedRoles={[Role.SuperAdmin, Role.Admin]}
                        actions={
                            <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin]}>
                                <Button size="sm" variant="outline">View Analytics</Button>
                            </RoleBasedAccess>
                        }
                    />

                </div>
            </div>

            {/* Quick Actions Based on Role */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions for Your Role</CardTitle>
                    <CardDescription>
                        Actions available based on your current access level
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                        <RoleBasedAccess allowedRoles={[Role.SuperAdmin]}>
                            <Button className="w-full" variant="default">
                                <Crown className="h-4 w-4 mr-2" />
                                System Dashboard
                            </Button>
                        </RoleBasedAccess>

                        <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin]}>
                            <Button className="w-full" variant="default">
                                <Shield className="h-4 w-4 mr-2" />
                                Admin Panel
                            </Button>
                        </RoleBasedAccess>

                        <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin, Role.Member]}>
                            <Button className="w-full" variant="outline">
                                <Activity className="h-4 w-4 mr-2" />
                                My Tasks
                            </Button>
                        </RoleBasedAccess>

                        <RoleBasedAccess allowedRoles={[Role.SuperAdmin, Role.Admin, Role.Member]}>
                            <Button className="w-full" variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Team Chat
                            </Button>
                        </RoleBasedAccess>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default RolePermissionsDashboard;