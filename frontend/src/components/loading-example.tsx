'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/providers/loading-provider';

export function LoadingExampleComponent() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  // Example async action
  const handleSubmitForm = async (data: any) => {
    try {
      startLoading('Submitting your request...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Handle success
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="space-y-4">
      <h1>Example Component</h1>
      <button
        onClick={() => handleSubmitForm({ test: true })}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Test Loading
      </button>
    </div>
  );
}

// Example middleware component for route changes
export function RouteChangeLoader() {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) => {
      // Only show loading for page transitions
      if (url !== window.location.pathname) {
        startLoading('Loading page...');
      }
    };

    const handleStop = () => {
      stopLoading();
    };

    window.addEventListener('beforeunload', handleStart);
    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleStop);
    router.events?.on('routeChangeError', handleStop);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleStop);
      router.events?.off('routeChangeError', handleStop);
    };
  }, [router, startLoading, stopLoading]);

  return null;
}