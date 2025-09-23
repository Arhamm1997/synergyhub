"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { refreshUser, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Check if we have a token and refresh user data on app load
        const token = localStorage.getItem('authToken');
        if (token && !isAuthenticated) {
            refreshUser();
        }
    }, [refreshUser, isAuthenticated]);

    return <>{children}</>;
}