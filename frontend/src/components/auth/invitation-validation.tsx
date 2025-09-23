"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/types';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface InvitationValidationProps {
  onValidInvitation: (businessId: string, email: string, role: Role) => void;
}

function InvitationValidationInner({ onValidInvitation }: InvitationValidationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('invitation');
    if (!token) return;

    const validateInvitation = async () => {
      try {
        const response = await api.get(`/invitations/validate?token=${token}`);
        const { invitation } = response.data;

        if (invitation) {
          const { email, businessId, role } = invitation;

          toast({
            title: "Invitation Valid",
            description: `Please complete your account setup to join as ${role}.`,
          });

          onValidInvitation(businessId, email, role);
        }
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

  const token = searchParams.get('token') || searchParams.get('invitation');
  if (!token) return null;

  return (
    <CardHeader className="text-center">
      <CardTitle>Accept Team Invitation</CardTitle>
      <CardDescription className="space-y-2">
        <p>Complete your account setup to join the team.</p>
        <div className="mt-4">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Validating invitation...</span>
          </div>
        </div>
      </CardDescription>
    </CardHeader>
  );
}

export function InvitationValidation({ onValidInvitation }: InvitationValidationProps) {
  return (
    <Suspense fallback={
      <CardHeader className="text-center">
        <CardTitle>Processing Invitation</CardTitle>
        <CardDescription>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Loading...</span>
          </div>
        </CardDescription>
      </CardHeader>
    }>
      <InvitationValidationInner onValidInvitation={onValidInvitation} />
    </Suspense>
  );
}