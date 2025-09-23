'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Plus, Search, Filter, Building, Mail, Phone, MapPin, Globe,
    DollarSign, Calendar, Users, BarChart3, TrendingUp, Star,
    Edit, Eye, MoreHorizontal, ExternalLink
} from 'lucide-react';
import { useClientsStore } from '@/store/clients-store';
import { useProjectsStore } from '@/store/projects-store';
import { useTasksStore } from '@/store/tasks-store';
import { useAuthStore } from '@/store/auth-store';
import type { Client } from '@/lib/types';
import { format } from 'date-fns';

interface ClientManagementPageProps {
    businessId: string;
}

interface ClientCardProps {
    client: Client;
    onClientClick: (client: Client) => void;
    onEditClick: (client: Client) => void;
}

function ClientCard({ client, onClientClick, onEditClick }: ClientCardProps) {
    const { projects } = useProjectsStore();
    const { tasks } = useTasksStore();

    const clientProjects = projects.filter(p => p.client?.id === client.id);
    const clientTasks = tasks.filter(t => t.project && clientProjects.some(p => p.id === t.project!.id));
    const totalRevenue = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const averageProgress = clientProjects.length > 0
        ? clientProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / clientProjects.length
        : 0;

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={client.logoUrl} alt={client.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg font-semibold">{client.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{client.industry}</p>
                            <div className="flex items-center space-x-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < (client.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({client.rating || 0})
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(client);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4" onClick={() => onClientClick(client)}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        <span>{clientProjects.length} projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>${totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Project Progress</span>
                        <span className="font-medium">{averageProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={averageProgress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {client.email && (
                            <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{client.email}</span>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{client.phone}</span>
                            </div>
                        )}
                    </div>
                    <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                        {client.status}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

interface CreateClientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    editingClient?: Client;
}

function CreateClientDialog({ isOpen, onClose, businessId, editingClient }: CreateClientDialogProps) {
    const { createClient, updateClient, isLoading } = useClientsStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        address: '',
        description: '',
        status: 'Active' as 'Active' | 'Inactive',
        rating: 0
    });

    useEffect(() => {
        if (editingClient) {
            setFormData({
                name: editingClient.name,
                email: editingClient.email || '',
                phone: editingClient.phone || '',
                website: editingClient.website || '',
                industry: editingClient.industry || '',
                address: editingClient.address || '',
                description: editingClient.description || '',
                status: editingClient.status,
                rating: editingClient.rating || 0
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                website: '',
                industry: '',
                address: '',
                description: '',
                status: 'Active',
                rating: 0
            });
        }
    }, [editingClient, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
            } else {
                await createClient(businessId, formData);
            }

            onClose();
        } catch (error) {
            console.error('Failed to save client:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingClient ? 'Edit Client' : 'Create New Client'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Client Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter client name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                value={formData.industry}
                                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                placeholder="e.g., Technology, Healthcare"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="client@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: 'Active' | 'Inactive') => setFormData(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter client address"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter client description or notes"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <Select
                            value={formData.rating.toString()}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">No Rating</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ClientManagementPage({ businessId }: ClientManagementPageProps) {
    const { clients, isLoading, error, fetchClients } = useClientsStore();
    const { projects, fetchProjects } = useProjectsStore();
    const { tasks, fetchTasks } = useTasksStore();
    const { user } = useAuthStore();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        if (businessId) {
            fetchClients(businessId);
            fetchProjects(businessId);
            fetchTasks(businessId);
        }
    }, [businessId, fetchClients, fetchProjects, fetchTasks]);

    const filteredClients = React.useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || client.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [clients, searchQuery, statusFilter]);

    const clientStats = React.useMemo(() => {
        const total = clients.length;
        const active = clients.filter(c => c.status === 'Active').length;
        const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const averageRating = clients.length > 0
            ? clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length
            : 0;

        return { total, active, totalRevenue, averageRating };
    }, [clients, projects]);

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
        // Could navigate to client details page or open detailed modal
        console.log('Client clicked:', client);
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
        setShowCreateDialog(true);
    };

    const handleCloseDialog = () => {
        setShowCreateDialog(false);
        setEditingClient(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading clients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Client Management</h1>
                    <p className="text-muted-foreground">
                        Manage your client relationships and track project progress
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Client
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Clients</p>
                                <p className="text-2xl font-bold">{clientStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Active Clients</p>
                                <p className="text-2xl font-bold">{clientStats.active}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">${clientStats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Rating</p>
                                <p className="text-2xl font-bold">{clientStats.averageRating.toFixed(1)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={(value: 'All' | 'Active' | 'Inactive') => setStatusFilter(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
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

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map(client => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        onClientClick={handleClientClick}
                        onEditClick={handleEditClick}
                    />
                ))}
            </div>

            {filteredClients.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No clients found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || statusFilter !== 'All'
                                ? 'Try adjusting your filters to see more clients.'
                                : 'Get started by adding your first client.'
                            }
                        </p>
                        {(!searchQuery && statusFilter === 'All') && (
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Client
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit Client Dialog */}
            <CreateClientDialog
                isOpen={showCreateDialog}
                onClose={handleCloseDialog}
                businessId={businessId}
                editingClient={editingClient}
            />
        </div>
    );
}