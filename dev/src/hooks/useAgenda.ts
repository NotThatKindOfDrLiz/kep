/**
 * Custom hooks for handling agenda threads and items
 */

import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { 
  buildAgendaThreadFilter, 
  buildAgendaItemsFilter,
  buildAdminConfigFilter,
  parseAgendaThread,
  parseAgendaItem,
  parseAdminConfig,
  createAgendaThreadTemplate,
  createAgendaItemTemplate,
  generateThreadId,
} from '@/lib/nostr/agenda';
import { AgendaItem, AgendaThread, AdminConfig } from '@/types';

/**
 * Hook for fetching the current agenda thread
 */
export function useCurrentAgendaThread() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['agenda-thread', 'current'],
    queryFn: async ({ signal }) => {
      // Fetch the most recent agenda thread
      const events = await nostr.query([buildAgendaThreadFilter()], { 
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]), 
      });
      
      if (!events || events.length === 0) {
        throw new Error('No agenda thread found');
      }
      
      // Parse and sort by created_at (newest first)
      const threads = events
        .map(parseAgendaThread)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
      
      // Return the most recent thread or create a default one if none exists
      return threads[0] || null;
    },
  });
}

/**
 * Hook for fetching agenda items for a specific thread
 */
export function useAgendaItems(threadId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['agenda-items', threadId],
    enabled: !!threadId, // Only run if threadId is available
    queryFn: async ({ signal }) => {
      // Fetch agenda items for the specified thread
      const events = await nostr.query([buildAgendaItemsFilter(threadId)], { 
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]), 
      });
      
      if (!events || events.length === 0) {
        return [];
      }
      
      // Parse and sort by priority (if available) or created_at
      return events
        .map(parseAgendaItem)
        .sort((a, b) => {
          // If both have priority, sort by priority
          if (a.priority !== undefined && b.priority !== undefined) {
            return a.priority - b.priority;
          }
          
          // If only one has priority, prioritize that one
          if (a.priority !== undefined) return -1;
          if (b.priority !== undefined) return 1;
          
          // Otherwise sort by creation date (newest first)
          return b.createdAt - a.createdAt;
        });
    },
  });
}

/**
 * Hook for fetching admin configuration
 */
export function useAdminConfig() {
  const { nostr } = useNostr();
  
  return useQuery({
    queryKey: ['admin-config'],
    queryFn: async ({ signal }) => {
      // Fetch the admin configuration
      const events = await nostr.query([buildAdminConfigFilter()], { 
        signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]), 
      });
      
      if (!events || events.length === 0) {
        // Return default config if none exists
        return {
          admins: [],
          defaultRelay: '',
          additionalRelays: [],
          threadAutoCreation: true,
          showSubmissionsByDefault: true,
        } as AdminConfig;
      }
      
      // Use the most recent config
      const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
      return parseAdminConfig(sortedEvents[0]);
    },
  });
}

/**
 * Hook for checking if the current user is an admin
 */
export function useIsAdmin() {
  const { user } = useCurrentUser();
  const adminConfigQuery = useAdminConfig();
  
  return {
    isAdmin: user && adminConfigQuery.data?.admins.includes(user.pubkey) || false,
    isLoading: adminConfigQuery.isLoading,
    error: adminConfigQuery.error,
  };
}

/**
 * Hook for submitting a new agenda item
 */
export function useSubmitAgendaItem() {
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      threadId, 
      content, 
      isAnonymous = false 
    }: { 
      threadId: string; 
      content: string; 
      isAnonymous?: boolean;
    }) => {
      // Create agenda item template
      const itemTemplate = createAgendaItemTemplate(threadId, content, isAnonymous);
      
      // Publish the event
      await publishEvent({
        kind: itemTemplate.kind!,
        content: itemTemplate.content!,
        tags: itemTemplate.tags!,
      });
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refresh the agenda items
      queryClient.invalidateQueries({ queryKey: ['agenda-items', variables.threadId] });
    },
  });
}

/**
 * Hook for creating a new agenda thread
 */
export function useCreateAgendaThread() {
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      title, 
      description = ''
    }: { 
      title: string; 
      description?: string;
    }) => {
      // Create agenda thread template
      const threadTemplate = createAgendaThreadTemplate(title, description);
      
      // Publish the event
      await publishEvent({
        kind: threadTemplate.kind!,
        content: threadTemplate.content!,
        tags: threadTemplate.tags!,
      });
      
      return { success: true, threadId: generateThreadId() };
    },
    onSuccess: () => {
      // Invalidate the query to refresh the agenda threads
      queryClient.invalidateQueries({ queryKey: ['agenda-thread'] });
    },
  });
}

/**
 * Hook for updating agenda item properties (admin only)
 */
export function useUpdateAgendaItem() {
  const { nostr } = useNostr();
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      threadId, 
      itemId, 
      updates
    }: { 
      threadId: string;
      itemId: string;
      updates: {
        priority?: number;
        starred?: boolean;
      };
    }) => {
      // Fetch the original event first
      const events = await nostr.query([
        { kinds: [1], ids: [itemId] }
      ], { signal: AbortSignal.timeout(5000) });
      
      if (!events || events.length === 0) {
        throw new Error('Agenda item not found');
      }
      
      const originalEvent = events[0];
      const originalTags = [...originalEvent.tags];
      
      // Update tags based on the updates
      let tags = originalTags.filter(tag => 
        tag[0] !== 'priority' && tag[0] !== 'starred'
      );
      
      if (updates.priority !== undefined) {
        tags.push(['priority', updates.priority.toString()]);
      }
      
      if (updates.starred !== undefined) {
        tags.push(['starred', updates.starred ? 'true' : 'false']);
      }
      
      // Publish an updated event
      await publishEvent({
        kind: 1,
        content: originalEvent.content,
        tags,
      });
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate the query to refresh the agenda items
      queryClient.invalidateQueries({ queryKey: ['agenda-items', variables.threadId] });
    },
  });
}

/**
 * Hook for updating agenda thread properties (admin only)
 */
export function useUpdateAgendaThread() {
  const { nostr } = useNostr();
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      threadId, 
      updates
    }: { 
      threadId: string;
      updates: {
        title?: string;
        description?: string;
        showSubmissions?: boolean;
      };
    }) => {
      // Fetch the original event first
      const events = await nostr.query([
        { kinds: [30001], "#d": [threadId] }
      ], { signal: AbortSignal.timeout(5000) });
      
      if (!events || events.length === 0) {
        throw new Error('Agenda thread not found');
      }
      
      const originalEvent = events[0];
      const originalTags = [...originalEvent.tags];
      
      // Update tags based on the updates
      let tags = originalTags.filter(tag => 
        tag[0] !== 'title' && tag[0] !== 'show'
      );
      
      if (updates.title !== undefined) {
        tags.push(['title', updates.title]);
      }
      
      if (updates.showSubmissions !== undefined) {
        tags.push(['show', updates.showSubmissions ? 'true' : 'false']);
      }
      
      // Publish an updated event
      await publishEvent({
        kind: 30001,
        content: updates.description !== undefined ? updates.description : originalEvent.content,
        tags,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate the query to refresh the agenda thread
      queryClient.invalidateQueries({ queryKey: ['agenda-thread'] });
    },
  });
}

/**
 * Hook for exporting agenda items
 */
export function useExportAgenda() {
  // Returns function to export agenda items in different formats
  return useCallback((items: AgendaItem[], format: 'markdown' | 'json') => {
    if (format === 'markdown') {
      return items.reduce((md, item, index) => {
        return md + `${index + 1}. ${item.content}\n`;
      }, '# Meeting Agenda\n\n');
    } else {
      return JSON.stringify(items, null, 2);
    }
  }, []);
}