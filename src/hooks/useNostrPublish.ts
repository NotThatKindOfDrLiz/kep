import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from './useNostr';
import { useCurrentUser } from './useCurrentUser';
import { getISOWeek } from '../utils/dateUtils';

interface NostrEventData {
  kind: number;
  content: string;
  tags?: string[][];
  [key: string]: any;
}

/**
 * Hook for publishing Nostr events
 * @returns Mutation object for publishing events
 */
export function useNostrPublish() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: NostrEventData) => {
      if (!user) {
        throw new Error('You must be logged in to publish events');
      }
      
      // Ensure we have the required event data
      if (!eventData.kind) {
        throw new Error('Event kind is required');
      }
      
      try {
        // Publish the event
        const publishedEvent = await nostr.event(eventData);
        return publishedEvent;
      } catch (error: any) {
        console.error('Failed to publish event:', error);
        throw new Error(error.message || 'Failed to publish event');
      }
    },
    
    // Invalidate relevant queries on success, ensuring the UI shows updated data
    onSuccess: (data) => {
      const currentWeek = getISOWeek(new Date());
      queryClient.invalidateQueries({ queryKey: ['agenda-items', currentWeek] });
    }
  });
}