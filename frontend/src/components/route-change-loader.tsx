'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/providers/loading-provider';

export function RouteChangeLoader() {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);
  const prevPathRef = useRef('');

  useEffect(() => {
    // Skip loading on initial mount
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      prevPathRef.current = pathname + '?' + searchParams?.toString();
      return;
    }

    const currentPath = pathname + '?' + searchParams?.toString();
    
    // Only show loading if path actually changed
    if (currentPath !== prevPathRef.current) {
      prevPathRef.current = currentPath;
      startLoading('Loading page...');
      
      // Short delay to prevent flash
      const timer = setTimeout(() => {
        stopLoading();
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [pathname, searchParams, startLoading, stopLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoading();
    };
  }, [stopLoading]);

  return null;
}

// Example usage in a component
export function LoadingExample() {
  const { startLoading, stopLoading } = useLoading();

  const handleAsyncAction = async () => {
    try {
      startLoading('Processing...');
      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Loading Example</h2>
      <button
        onClick={handleAsyncAction}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Test Loading
      </button>
    </div>
  );
}