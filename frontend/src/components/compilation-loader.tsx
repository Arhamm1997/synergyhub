'use client';

import { useEffect, useRef } from 'react';
import { useLoading } from '@/providers/loading-provider';

export function CompilationLoader() {
    const { startLoading, stopLoading } = useLoading();
    const isCompiling = useRef(false);

    useEffect(() => {
        // Add event listeners for compilation states
        const handleStart = () => {
            if (!isCompiling.current) {
                isCompiling.current = true;
                startLoading('Compiling...');
            }
        };

        const handleDone = () => {
            if (isCompiling.current) {
                isCompiling.current = false;
                stopLoading();
            }
        };

        // Listen for Next.js compilation events
        if (typeof window !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target.textContent?.includes('○ Compiling')) {
                        handleStart();
                    }
                    if (mutation.target.textContent?.includes('✓ Compiled')) {
                        handleDone();
                    }
                });
            });

            // Start observing the body for Next.js compilation messages
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });

            return () => {
                observer.disconnect();
                if (isCompiling.current) {
                    stopLoading();
                    isCompiling.current = false;
                }
            };
        }
    }, [startLoading, stopLoading]);

    return null;
}