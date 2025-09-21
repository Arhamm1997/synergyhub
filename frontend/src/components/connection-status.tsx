'use client';

import React, { useEffect, useState } from 'react';
import { api, API_BASE_URL } from '@/lib/api-config';
import { getSocket } from '@/lib/socket-config';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const socket = getSocket();

    // Check API connection
    const checkApiConnection = async () => {
      try {
        // Remove /api from the URL since health endpoint is at the root
        const baseUrl = API_BASE_URL.replace('/api', '');
        const response = await fetch(`${baseUrl}/health`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }
        
        if (mounted) {
          setApiStatus('connected');
          setRetryCount(0); // Reset retry count on successful connection
        }
      } catch (error) {
        console.error('API connection error:', error);
        if (mounted) {
          setApiStatus('disconnected');
          // Increase retry frequency when disconnected
          if (retryCount < 5) {
            setRetryCount(prev => prev + 1);
          }
        }
      }
    };

    // Initial checks
    checkApiConnection();

    // Setup socket event listeners
    socket.on('connect', () => {
      console.log('WebSocket Connected');
      if (mounted) setSocketStatus('connected');
    });

    socket.on('connection_ack', (data) => {
      console.log('WebSocket Connection Acknowledged:', data);
      if (mounted && data.status === 'connected') {
        setSocketStatus('connected');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket Disconnected:', reason);
      if (mounted) setSocketStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket Connection Error:', error);
      if (mounted) setSocketStatus('disconnected');
      // Try to reconnect after a delay
      setTimeout(() => {
        if (mounted && socket) {
          socket.connect();
        }
      }, 5000);
    });

    // Periodic API check with dynamic interval based on connection status
    const checkInterval = apiStatus === 'connected' ? 30000 : 5000;
    const intervalId = setInterval(checkApiConnection, checkInterval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [apiStatus, retryCount]);

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-sm">
      {/* API Status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-xs font-medium">API</span>
      </div>

      {/* Socket Status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className="text-xs font-medium">Socket</span>
      </div>
    </div>
  );
}