import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useNostr } from './useNostr';

interface NostrFilter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  '#e'?: string[];
  '#p'?: string[];
  '#t'?: string[];
  since?: number;
  until?: number;
  limit?: number;
  [key: string]: any;
}

interface UseNostrQueryOptions<TData> {
  filters: NostrFilter[];
  queryOptions?: Omit<UseQueryOptions<unknown, Error, TData>, 'queryKey' | 'queryFn'>;
  timeoutMs?: number;
  transform?: (events: any[]) => TData;
  queryKey?: any[];
}

/**
 * Custom hook to query Nostr events with TanStack Query
 */
export function useNostrQuery<TData = any[]>({ 
  filters, 
  queryOptions = {}, 
  timeoutMs = 5000,
  transform = (events) => events as unknown as TData,
  queryKey = [],
}: UseNostrQueryOptions<TData>) {
  const { nostr } = useNostr();
  
  return useQuery({
    queryKey: ['nostr-query', ...queryKey, filters],
    queryFn: async ({ signal }): Promise<TData> => {
      // Create a timeout signal
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      // Combine with the query signal
      const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
      
      try {
        // Query for events
        const events = await nostr.query(filters, { signal: combinedSignal });
        
        // Transform the events if a transform function is provided
        return transform(events);
      } catch (err: any) {
        console.error("Failed to query Nostr events:", err);
        throw new Error(err.message || "Failed to query Nostr events");
      }
    },
    ...queryOptions,
  });
}