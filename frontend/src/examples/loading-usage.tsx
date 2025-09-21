// Example usage in any component:

'use client';

import { useLoading } from '@/providers/loading-provider';

export function ExampleComponent() {
  const { startLoading, stopLoading } = useLoading();

  const handleSomeAsyncAction = async () => {
    try {
      startLoading('Processing your request...');
      // Perform async operation
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  // For route changes, you can use in a layout:
  useEffect(() => {
    const handleStart = () => startLoading('Loading...');
    const handleStop = () => stopLoading();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, []);

  return (
    // Your component JSX
  );
}