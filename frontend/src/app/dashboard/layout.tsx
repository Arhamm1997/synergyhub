
"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { ChatPanel } from "@/components/messages/chat-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, refreshUser, isAuthenticated } = useAuthStore();
  
  // Initialize user data if we don't have it but are authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);
  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <ChatPanel />
    </SidebarProvider>
  );
}
