'use client';

import { useEffect } from 'react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = true,
  message = 'Loading...',
  className
}: LoadingScreenProps) {
  // Prevent scroll while loading on full screen
  useEffect(() => {
    if (fullScreen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [fullScreen]);

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
      className
    )}>
      <div className="relative">
        <Logo className="w-16 h-16" />
        <div className="absolute inset-0 animate-pulse-ring">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-lg font-medium text-foreground/90">{message}</p>
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}