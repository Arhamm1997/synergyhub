'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Settings, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import RolePermissionsDashboard from '@/components/admin/role-permissions-dashboard';
import { Role } from '@/lib/types';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="container mx-auto p-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Please log in to access the admin dashboard</p>
                        <Button onClick={() => router.push('/auth/login')} className="mt-4">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Role-based access control demonstration
                        </p>
                    </div>
                </div>
                <Badge variant="default" className="bg-blue-500">
                    Logged in as: {user.name}
                    ({user.role === Role.SuperAdmin ? 'Super Admin' :
                        user.role === Role.Admin ? 'Admin' :
                            user.role === Role.Member ? 'Member' : 'Client'})
                </Badge>
            </div>

            {/* Welcome Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-800">
                        Welcome to SynergyHub Admin Dashboard
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                        This dashboard demonstrates the role-based permission system. Your access level determines what features you can see and use.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                            <UserPlus className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <h3 className="font-semibold">Admin Accounts</h3>
                            <p className="text-sm text-muted-foreground">Maximum 20 admin accounts allowed</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <Settings className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <h3 className="font-semibold">Role-Based Access</h3>
                            <p className="text-sm text-muted-foreground">Granular permission control</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <h3 className="font-semibold">Unlimited Employees</h3>
                            <p className="text-sm text-muted-foreground">No limit on employee accounts</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role Permissions Dashboard */}
            <RolePermissionsDashboard />

            {/* Instructions for Testing */}
            <Card>
                <CardHeader>
                    <CardTitle>Testing Instructions</CardTitle>
                    <CardDescription>
                        How to test the authentication and role system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">🔑 First Admin Account Creation:</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            The first user to sign up will automatically become a Super Admin with full system access.
                        </p>
                        <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Log out if currently logged in</li>
                            <li>Go to the signup page</li>
                            <li>Create an account (this will be your Super Admin)</li>
                            <li>Login and return to this dashboard to see Super Admin features</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">👥 Additional Admin Accounts:</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            After the first Super Admin, you can create up to 19 more Admin accounts.
                        </p>
                        <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Create new accounts with role "Admin"</li>
                            <li>System will enforce the 20-admin limit</li>
                            <li>Test with different email addresses</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">💼 Employee Accounts:</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            Employee accounts have limited access and no restrictions on quantity.
                        </p>
                        <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Create accounts with role "Member"</li>
                            <li>No limit on number of employee accounts</li>
                            <li>Login as employee to see limited dashboard features</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}