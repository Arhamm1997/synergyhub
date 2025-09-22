"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface InvitationValidationProps {
  onValidInvitation: (businessId: string, email: string, role: Role) => void;
}

export function InvitationValidation({ onValidInvitation }: InvitationValidationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('invitation');
    if (!token) return;

    const validateInvitation = async () => {
      try {
        const response = await api.get(`/invitations/validate?token=${token}`);
        const { businessId, email, role } = response.data;

        toast({
          title: "Invitation Valid",
          description: `Please complete your account setup to join as ${role}.`,
        });

        onValidInvitation(businessId, email, role);
      } catch (error: any) {
        toast({
          title: "Invalid Invitation",
          description: error?.response?.data?.message || "This invitation is no longer valid.",
          variant: "destructive",
        });
        router.push('/signup');
      }
    };

    validateInvitation();
  }, [searchParams, router, toast, onValidInvitation]);

  const token = searchParams.get('invitation');
  if (!token) return null;

  return (
    <CardHeader className="text-center">
      <CardTitle>Accept Team Invitation</CardTitle>
      <CardDescription>
        Complete your account setup to join the team.
      </CardDescription>
    </CardHeader>
  );
}