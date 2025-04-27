import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { useNostr } from '../hooks/useNostr';
import { useQuery } from '@tanstack/react-query';
import { getISOWeek } from '../utils/dateUtils';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface AgendaItem {
  id: string;
  content: string;
  author: string;
  project?: string;
  pubkey: string;
  createdAt: Date;
}

interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
}

const WeeklyThread: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<string>(getISOWeek(new Date()));
  const { nostr } = useNostr();
  
  // Query to fetch agenda items for the current week
  const { 
    data: agendaItems, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['agenda-items', currentWeek],
    queryFn: async ({ signal }): Promise<AgendaItem[]> => {
      try {
        // Add a timeout to our query for better UX
        const timeoutSignal = AbortSignal.timeout(5000);
        const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
        
        // Query for kind:1 (text_note) events with the appropriate week tag
        const events = await nostr.query([
          { 
            kinds: [1], 
            '#t': [`week:${currentWeek}`],
            limit: 50
          }
        ], { signal: combinedSignal }) as NostrEvent[];
        
        // Process and sort events by timestamp (newest first)
        return events
          .map(event => {
            const author = event.tags.find(tag => tag[0] === 't' && tag[1].startsWith('author:'))
              ?.slice(1)[0]?.replace('author:', '') || 'Anonymous';
              
            const project = event.tags.find(tag => tag[0] === 't' && tag[1].startsWith('project:'))
              ?.slice(1)[0]?.replace('project:', '');
              
            return {
              id: event.id,
              content: event.content,
              author, 
              project,
              pubkey: event.pubkey,
              createdAt: new Date(event.created_at * 1000),
            };
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (err: any) {
        console.error("Failed to fetch agenda items:", err);
        throw new Error(err.message || "Failed to fetch agenda items");
      }
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute to keep thread updated
  });
  
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load agenda items: {(error as Error)?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week's Agenda (Week {currentWeek})</CardTitle>
        <CardDescription>
          Discussion items submitted by the team
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : agendaItems?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No agenda items have been submitted yet for this week.</p>
            <p className="mt-2">Be the first to add an item!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {agendaItems?.map((item) => (
              <div 
                key={item.id} 
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">{item.author}</span>
                    {item.project && (
                      <Badge variant="outline" className="ml-2">
                        {item.project}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="whitespace-pre-wrap break-words">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyThread;