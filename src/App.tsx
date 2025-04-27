import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
// import { NostrProvider } from '@nostrify/react'; // TEMPORARILY COMMENT OUT
import AppRouter from './AppRouter';
import { Toaster } from './components/ui/sonner';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Default relays (you can leave them defined for later use)
const defaultRelays: string[] = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://nostr.mom',
  'wss://relay.current.fyi'
];

const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* <NostrProvider relays={defaultRelays}> */} {/* TEMPORARILY COMMENT OUT */}
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <Toaster position="bottom-right" />
        </QueryClientProvider>
      {/* </NostrProvider> */}
    </ThemeProvider>
  );
};

export default App;
