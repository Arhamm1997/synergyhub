"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NotFoundInner() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="text-muted-foreground">
                    The page you are looking for does not exist.
                </p>
                <Button asChild>
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </div>
    );
}

export default function NotFound() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotFoundInner />
        </Suspense>
    );
}