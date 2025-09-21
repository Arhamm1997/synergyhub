import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { ConnectionStatus } from '@/components/connection-status';
import { LoadingProvider } from '@/providers/loading-provider';
import { RouteChangeLoader } from '@/components/route-change-loader';

export const metadata: Metadata = {
  title: 'SynergyHub',
  description: 'The all-in-one platform for seamless team collaboration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <RouteChangeLoader />
            {children}
            <Toaster />
            <ConnectionStatus />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
