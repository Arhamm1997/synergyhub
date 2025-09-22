"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { ClockIcon } from "lucide-react";

export default function AdminRequestPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <Logo className="mx-auto" />
        <Card className="p-6">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold">Admin Request Pending</h1>
          <p className="mb-6 text-muted-foreground">
            Your request to join as an admin is being reviewed. You&apos;ll receive an
            email notification once your request has been processed.
          </p>
          <div className="space-y-4">
            <Button asChild variant="secondary" className="w-full">
              <Link href="/">Return to Login</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}