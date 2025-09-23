'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Shield, Users, AlertCircle } from 'lucide-react';
import { Role } from '@/lib/types';
import { api } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

const invitationFormSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    role: z.enum([Role.Admin, Role.Member], {
        required_error: 'Please select a role',
    }),
});

type InvitationFormValues = z.infer<typeof invitationFormSchema>;

interface InvitationDialogProps {
    onInvitationSent: () => void;
}

export function InvitationDialog({ onInvitationSent }: InvitationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuthStore();

    const form = useForm<InvitationFormValues>({
        resolver: zodResolver(invitationFormSchema),
        defaultValues: {
            email: '',
            role: Role.Member,
        },
    });

    const selectedRole = form.watch('role');

    const onSubmit = async (values: InvitationFormValues) => {
        try {
            setIsLoading(true);

            await api.post('/invitations/send', {
                email: values.email,
                role: values.role,
                businessId: user?.defaultBusiness || user?.businesses?.[0],
            });

            toast({
                title: 'Invitation Sent Successfully!',
                description: `An invitation has been sent to ${values.email} for the role of ${values.role === Role.Admin ? 'Administrator' : 'Employee'}.`,
            });

            form.reset();
            setIsOpen(false);
            onInvitationSent();
        } catch (error: any) {
            toast({
                title: 'Failed to Send Invitation',
                description: error?.response?.data?.message || 'An error occurred while sending the invitation.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleDescription = (role: Role) => {
        switch (role) {
            case Role.Admin:
                return {
                    title: 'Administrator Access',
                    description: 'Full access to manage team, projects, settings, and send invitations',
                    features: [
                        'Manage all team members and projects',
                        'Access system settings and configurations',
                        'Send invitations to new team members',
                        'View and manage all business data',
                        'Complete administrative control'
                    ],
                    color: 'blue',
                    icon: <Shield className="h-4 w-4" />,
                    limit: '(Maximum 20 admin accounts)'
                };
            case Role.Member:
                return {
                    title: 'Employee Access',
                    description: 'Standard access to assigned tasks and team collaboration',
                    features: [
                        'Access to assigned projects and tasks',
                        'Team chat and collaboration tools',
                        'File sharing and document access',
                        'Project progress tracking',
                        'Client communication (when assigned)'
                    ],
                    color: 'green',
                    icon: <Users className="h-4 w-4" />,
                    limit: '(Unlimited employee accounts)'
                };
            default:
                return null;
        }
    };

    const roleInfo = getRoleDescription(selectedRole);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Send Invitation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Invite Team Member
                    </DialogTitle>
                    <DialogDescription>
                        Send an invitation email to add a new team member. Choose their role carefully as it determines their access level.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="name@example.com"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Role Selection */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Role & Access Level
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role for this user" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={Role.Admin}>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-blue-500" />
                                                    <span>Administrator</span>
                                                    <Badge variant="outline" className="text-xs">Full Access</Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={Role.Member}>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-green-500" />
                                                    <span>Employee</span>
                                                    <Badge variant="outline" className="text-xs">Limited Access</Badge>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Role Description Card */}
                        {roleInfo && (
                            <Card className={`border-${roleInfo.color}-200 bg-${roleInfo.color}-50/50`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            {roleInfo.icon}
                                            {roleInfo.title}
                                        </CardTitle>
                                        <Badge variant="outline" className="text-xs">
                                            {roleInfo.limit}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {roleInfo.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">This role includes:</p>
                                        <ul className="text-sm space-y-1">
                                            {roleInfo.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span className="text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Warning for Admin Role */}
                        {selectedRole === Role.Admin && (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-amber-800">
                                        Admin Account Limit
                                    </p>
                                    <p className="text-sm text-amber-700">
                                        Remember that admin accounts are limited to 20 total. Admin users will have complete access to manage your team and system settings.
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Invitation
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}