/**
 * Components for displaying and managing agenda threads
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AgendaItemsList, AgendaSubmissionForm } from './AgendaItems';
import { 
  useCurrentAgendaThread, 
  useAgendaItems, 
  useCreateAgendaThread,
  useUpdateAgendaThread,
  useExportAgenda,
  useIsAdmin
} from '@/hooks/useAgenda';
import { AgendaThread, AgendaItem, AIGrouping } from '@/types';
import { withAriaAttributes } from '@/lib/accessibility';
import { groupSimilarItems } from '@/lib/ai/agenda';

/**
 * Main component to display the current agenda thread
 */
export const CurrentAgendaThread: React.FC = () => {
  const { data: currentThread, isLoading, error } = useCurrentAgendaThread();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const [useAIGrouping, setUseAIGrouping] = useState(false);
  
  if (isLoading || isLoadingAdmin) {
    return <AgendaThreadSkeleton />;
  }
  
  if (error || !currentThread) {
    return <CreateNewThreadDialog />;
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <AgendaThreadCard 
        thread={currentThread} 
        isAdmin={isAdmin} 
        useAIGrouping={useAIGrouping}
        onToggleAI={() => setUseAIGrouping(!useAIGrouping)}
      />
    </div>
  );
};

interface AgendaThreadCardProps {
  thread: AgendaThread;
  isAdmin: boolean;
  useAIGrouping: boolean;
  onToggleAI: () => void;
}

/**
 * Card component to display a single agenda thread with its items
 */
const AgendaThreadCard: React.FC<AgendaThreadCardProps> = ({ 
  thread, 
  isAdmin,
  useAIGrouping,
  onToggleAI
}) => {
  const { data: items = [], isLoading } = useAgendaItems(thread.id);
  const [showItems, setShowItems] = useState(thread.showSubmissions);
  const exportAgenda = useExportAgenda();
  const [aiGroupedItems, setAiGroupedItems] = useState<AIGrouping[]>([]);
  
  // Group items with AI when requested
  React.useEffect(() => {
    if (useAIGrouping && items.length > 0) {
      setAiGroupedItems(groupSimilarItems(items));
    } else {
      setAiGroupedItems([]);
    }
  }, [items, useAIGrouping]);
  
  const handleExport = (format: 'markdown' | 'json') => {
    const exportedData = exportAgenda(items, format);
    
    // Create a downloadable file
    const blob = new Blob([exportedData], { 
      type: format === 'json' ? 'application/json' : 'text/markdown' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-${thread.id}.${format === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{thread.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center mt-1">
                <FiCalendar className="mr-1" />
                <span>
                  {format(thread.startDate, 'MMMM d')} - {format(thread.endDate, 'MMMM d, yyyy')}
                </span>
              </div>
            </CardDescription>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <EditThreadDialog thread={thread} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('markdown')}
                aria-label="Export as Markdown"
              >
                Export MD
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('json')}
                aria-label="Export as JSON"
              >
                Export JSON
              </Button>
            </div>
          )}
        </div>
        
        {thread.description && (
          <div className="mt-4 text-sm">{thread.description}</div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AgendaSubmissionForm threadId={thread.id} />
        
        {isAdmin && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
            <div className="flex items-center gap-2">
              <Switch
                id="ai-grouping"
                checked={useAIGrouping}
                onCheckedChange={onToggleAI}
                aria-label="Use AI to group similar items"
              />
              <Label htmlFor="ai-grouping">Group similar items with AI</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowItems(!showItems)}
                className="flex items-center gap-1"
                aria-label={showItems ? "Hide agenda items" : "Show agenda items"}
              >
                {showItems ? (
                  <>
                    <FiEyeOff className="mr-1" /> Hide items
                  </>
                ) : (
                  <>
                    <FiEye className="mr-1" /> Show items
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-full h-24" />
          </div>
        ) : showItems ? (
          useAIGrouping ? (
            <div className="space-y-8">
              {aiGroupedItems.map((group, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">{group.title}</h3>
                  <AgendaItemsList 
                    items={group.items}
                    threadId={thread.id}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AgendaItemsList 
              items={items}
              threadId={thread.id}
              isAdmin={isAdmin}
            />
          )
        ) : (
          <div className="text-center p-8 text-gray-500">
            Agenda items are hidden. {isAdmin ? "Click 'Show items' to view them." : "Contact the admin to show the items."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Dialog for creating a new agenda thread
 */
export const CreateNewThreadDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`Meeting Agenda - ${format(new Date(), 'MMMM d')}`);
  const [description, setDescription] = useState('');
  
  const { mutate: createThread, isPending } = useCreateAgendaThread();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createThread(
      { title, description },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">No Active Agenda Thread</h2>
        <p className="text-gray-500 mt-2">
          There's no active agenda thread for this week. Create one to get started!
        </p>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg">Create New Agenda Thread</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Agenda Thread</DialogTitle>
            <DialogDescription>
              Set up a new thread for collecting agenda items.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly Team Meeting"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this meeting's goals or context"
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? "Creating..." : "Create Thread"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Dialog for editing an existing thread
 */
const EditThreadDialog: React.FC<{ thread: AgendaThread }> = ({ thread }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [description, setDescription] = useState(thread.description || '');
  const [showSubmissions, setShowSubmissions] = useState(thread.showSubmissions);
  
  const { mutate: updateThread, isPending } = useUpdateAgendaThread();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateThread(
      { 
        threadId: thread.id, 
        updates: { 
          title, 
          description, 
          showSubmissions 
        } 
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Agenda Thread</DialogTitle>
          <DialogDescription>
            Modify the settings for this agenda thread.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-submissions"
              checked={showSubmissions}
              onCheckedChange={setShowSubmissions}
            />
            <Label htmlFor="show-submissions">
              Show submissions to all participants
            </Label>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Skeleton loader for agenda thread
 */
const AgendaThreadSkeleton: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};