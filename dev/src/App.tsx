import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import NostrProvider from '@/components/NostrProvider';
import AppRouter from './AppRouter';
import './App.css';

// Default relays for the application
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.snort.social',
  'wss://nos.lol',
];

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="kep-ui-theme">
        <NostrProvider relays={DEFAULT_RELAYS}>
          <AppRouter />
          <Toaster />
        </NostrProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;