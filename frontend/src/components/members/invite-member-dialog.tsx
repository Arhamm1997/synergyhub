'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api-config';
import { Role, BusinessQuotas } from '@/lib/types';

interface InviteMemberDialogProps {
  businessId: string;  // Required - ID of the business to manage members for
  onInviteSent: () => void;  // Callback when invitation is successfully sent
  currentUserRole: Role;  // Current user's role for permission checks
}

export function InviteMemberDialog({ businessId, onInviteSent, currentUserRole }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [memberData, setMemberData] = useState({
    email: '',
    name: '',
    role: Role.Member,
    department: '',
    phoneNumber: '',
    designation: '',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [quotas, setQuotas] = useState<BusinessQuotas | null>(null);
  const { toast } = useToast();

  const fetchQuotas = async () => {
    try {
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      
      const response = await api.get(`/businesses/${businessId}/member-quotas`);
      setQuotas(response.data.quotas);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch member quotas',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchQuotas();
    }
  }, [open]);

  const handleInvite = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!memberData.email || !memberData.name || !memberData.department || !memberData.startDate) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Check quota limits
      if (quotas) {
        if (memberData.role === Role.Admin && quotas.currentAdmins >= quotas.maxAdmins) {
          toast({
            title: 'Quota Exceeded',
            description: 'Maximum number of admins reached',
            variant: 'destructive',
          });
          return;
        }
        if (memberData.role === Role.Member && quotas.currentMembers >= quotas.maxMembers) {
          toast({
            title: 'Quota Exceeded',
            description: 'Maximum number of members reached',
            variant: 'destructive',
          });
          return;
        }
      }

      // Send invitation with all member details
      await api.post('/invitations/send', {
        ...memberData,
        businessId,
        status: 'Pending',
        avatarUrl: '', // Will be set when user accepts invitation
        avatarHint: memberData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      });

      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${memberData.email}`,
      });

      setOpen(false);
      setMemberData({
        email: '',
        name: '',
        role: Role.Member,
        department: '',
        phoneNumber: '',
        designation: '',
        startDate: new Date().toISOString().split('T')[0],
      });
      onInviteSent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member to your business.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter member's email"
                value={memberData.email}
                onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter member's name"
                value={memberData.name}
                onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={memberData.role} 
                onValueChange={(value: string) => setMemberData({ ...memberData, role: value as Role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {currentUserRole === Role.SuperAdmin && (
                    <SelectItem value={Role.Admin}>Admin</SelectItem>
                  )}
                  <SelectItem value={Role.Member}>Member</SelectItem>
                  <SelectItem value={Role.Client}>Client</SelectItem>
                </SelectContent>
              </Select>
              {quotas && (
                <div className="text-sm text-gray-500">
                  {memberData.role === Role.Admin && (
                    <p>Admin slots: {quotas.currentAdmins}/{quotas.maxAdmins}</p>
                  )}
                  {memberData.role === Role.Member && (
                    <p>Member slots: {quotas.currentMembers}/{quotas.maxMembers}</p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                type="text"
                placeholder="Enter department"
                value={memberData.department}
                onChange={(e) => setMemberData({ ...memberData, department: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                type="text"
                placeholder="Enter designation"
                value={memberData.designation}
                onChange={(e) => setMemberData({ ...memberData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={memberData.phoneNumber}
                onChange={(e) => setMemberData({ ...memberData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={memberData.startDate}
                onChange={(e) => setMemberData({ ...memberData, startDate: e.target.value })}
                required
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={!memberData.email || !memberData.name || !memberData.department || !memberData.startDate || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}