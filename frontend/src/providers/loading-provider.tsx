'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface LoadingContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const startLoading = (msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setMessage(undefined);
  };

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {children}
      {isLoading && <LoadingScreen message={message} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}