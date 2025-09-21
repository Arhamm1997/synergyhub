'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Invitation {
  _id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

interface PendingInvitationsProps {
  businessId: string;
  onInvitationUpdate: () => void;
}

export function PendingInvitations({ businessId, onInvitationUpdate }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, [businessId]);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/invitations/business/${businessId}`);
      setInvitations(response.data.invitations);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      await api.post(`/invitations/${invitationId}/resend`);
      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });
      fetchInvitations();
      onInvitationUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await api.delete(`/invitations/${invitationId}`);
      toast({
        title: 'Success',
        description: 'Invitation cancelled successfully',
      });
      fetchInvitations();
      onInvitationUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Manage your team member invitations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation._id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  Expires {formatDistanceToNow(new Date(invitation.expiresAt))}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResend(invitation._id)}
                >
                  Resend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleCancel(invitation._id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}