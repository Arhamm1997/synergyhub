'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Shield, Users, Clock, Check, X, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Role } from '@/lib/types';
import { api } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { InvitationDialog } from '@/components/admin/invitation-dialog';

interface Invitation {
    _id: string;
    email: string;
    role: Role;
    status: 'pending' | 'accepted' | 'expired';
    invitedBy: {
        _id: string;
        name: string;
        email: string;
    };
    expiresAt: string;
    createdAt: string;
}

export default function InvitationsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adminCount, setAdminCount] = useState(0);

    // Check if user has admin permissions
    useEffect(() => {
        if (user && ![Role.SuperAdmin, Role.Admin].includes(user.role)) {
            router.push('/dashboard');
            return;
        }
    }, [user, router]);

    const fetchInvitations = async () => {
        try {
            setIsLoading(true);

            // Get invitations and admin count
            const [invitationsRes, statsRes] = await Promise.all([
                api.get('/invitations'),
                api.get('/auth/admin-stats')
            ]);

            setInvitations(invitationsRes.data.invitations || []);
            setAdminCount(statsRes.data.adminCount || 0);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to load invitations',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleResendInvitation = async (invitationId: string) => {
        try {
            await api.post(`/invitations/${invitationId}/resend`);
            toast({
                title: 'Success',
                description: 'Invitation resent successfully',
            });
            fetchInvitations();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to resend invitation',
                variant: 'destructive',
            });
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        try {
            await api.delete(`/invitations/${invitationId}`);
            toast({
                title: 'Success',
                description: 'Invitation cancelled successfully',
            });
            fetchInvitations();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to cancel invitation',
                variant: 'destructive',
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'accepted':
                return <Badge variant="default" className="bg-green-500"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
            case 'expired':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Expired</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: Role) => {
        switch (role) {
            case Role.SuperAdmin:
                return <Badge variant="default" className="bg-purple-500"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>;
            case Role.Admin:
                return <Badge variant="default" className="bg-blue-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
            case Role.Member:
                return <Badge variant="outline"><Users className="h-3 w-3 mr-1" />Employee</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    if (!user || ![Role.SuperAdmin, Role.Admin].includes(user.role)) {
        return (
            <div className="container mx-auto p-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
                        <Button onClick={() => router.push('/dashboard')} className="mt-4">
                            Go to Dashboard
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
                        <h1 className="text-3xl font-bold">Invitation Management</h1>
                        <p className="text-muted-foreground">
                            Send invitations and manage team access
                        </p>
                    </div>
                </div>
                <InvitationDialog onInvitationSent={fetchInvitations} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin Accounts</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{adminCount}/20</div>
                        <p className="text-xs text-muted-foreground">
                            {20 - adminCount} slots remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invitations.filter(inv => inv.status === 'pending').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Waiting for response
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invitations.length}</div>
                        <p className="text-xs text-muted-foreground">
                            All time invitations sent
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Invitations List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Invitations</CardTitle>
                        <CardDescription>
                            Manage and track all sent invitations
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading invitations...
                            </div>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="text-center py-8">
                            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No invitations sent</h3>
                            <p className="text-muted-foreground mb-4">
                                Start building your team by sending invitations.
                            </p>
                            <InvitationDialog onInvitationSent={fetchInvitations} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium">{invitation.email}</span>
                                                {getRoleBadge(invitation.role)}
                                                {getStatusBadge(invitation.status)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Invited by {invitation.invitedBy.name} •
                                                {invitation.status === 'pending' && (
                                                    <span> Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                                                )}
                                                {invitation.status !== 'pending' && (
                                                    <span> Sent {new Date(invitation.createdAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {invitation.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResendInvitation(invitation._id)}
                                                >
                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                    Resend
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleCancelInvitation(invitation._id)}
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Invitation System Rules</CardTitle>
                    <CardDescription>
                        Important guidelines for managing team invitations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-blue-600 mb-2">👑 Admin Accounts</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Maximum 20 admin accounts allowed</li>
                                <li>• Admins have full system access</li>
                                <li>• Can manage teams and projects</li>
                                <li>• Can send invitations to others</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-600 mb-2">👥 Employee Accounts</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• Unlimited employee accounts</li>
                                <li>• Limited access to assigned tasks</li>
                                <li>• Can collaborate with team</li>
                                <li>• Cannot send invitations</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-purple-600 mb-2">🔒 Access Control</h4>
                        <p className="text-sm text-muted-foreground">
                            Only the first user (Super Admin) and invited Admins can send invitations.
                            All team members must be invited by an administrator - no one can join without permission.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}