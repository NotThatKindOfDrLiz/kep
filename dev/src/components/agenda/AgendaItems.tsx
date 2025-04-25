/**
 * Components for creating and managing agenda items
 */

import React, { useState, useRef, useEffect } from 'react';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { MicIcon, MicOffIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useVoiceToText } from '@/lib/accessibility';
import { useSubmitAgendaItem, useUpdateAgendaItem } from '@/hooks/useAgenda';
import { AgendaItem } from '@/types';

interface AgendaItemProps {
  item: AgendaItem;
  threadId: string;
  isAdmin: boolean;
}

/**
 * Component to display a single agenda item
 */
export const AgendaItemCard: React.FC<AgendaItemProps> = ({ item, threadId, isAdmin }) => {
  const { mutate: updateItem } = useUpdateAgendaItem();
  const formattedDate = new Date(item.createdAt * 1000).toLocaleDateString();
  
  const handleToggleStar = () => {
    if (isAdmin) {
      updateItem({
        threadId,
        itemId: item.id,
        updates: {
          starred: !item.starred,
        },
      });
    }
  };

  const handleUpdatePriority = (newPriority: number) => {
    if (isAdmin) {
      updateItem({
        threadId,
        itemId: item.id,
        updates: {
          priority: newPriority,
        },
      });
    }
  };
  
  return (
    <Card className={`w-full transition-all ${item.starred ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center">
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleToggleStar}
                    aria-label={item.starred ? "Unstar item" : "Star item"}
                    className="mr-2 text-amber-500 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    {item.starred ? <BsStarFill size={18} /> : <BsStar size={18} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {item.starred ? "Unstar this item" : "Star this item"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {item.isAnonymous ? 'Anonymous' : item.submittedBy?.name || 'Unknown user'}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {formattedDate}
            </div>
            {item.isAnonymous && (
              <Badge variant="outline" className="text-xs">Anonymous</Badge>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdatePriority(item.priority ? item.priority - 1 : 1)}
              aria-label="Increase priority"
            >
              ↑
            </Button>
            <Badge variant="secondary" className="mx-1">
              {item.priority || '-'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdatePriority(item.priority ? item.priority + 1 : 9999)}
              aria-label="Decrease priority"
            >
              ↓
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap">{item.content}</p>
      </CardContent>
    </Card>
  );
};

interface AgendaSubmissionFormProps {
  threadId: string;
}

/**
 * Form component for submitting new agenda items
 */
export const AgendaSubmissionForm: React.FC<AgendaSubmissionFormProps> = ({ threadId }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { mutate: submitAgendaItem, isPending } = useSubmitAgendaItem();
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript,
    error: voiceError
  } = useVoiceToText();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update content when transcript changes
  useEffect(() => {
    if (transcript) {
      setContent(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim()) {
      submitAgendaItem(
        {
          threadId,
          content: content.trim(),
          isAnonymous,
        },
        {
          onSuccess: () => {
            setContent('');
            resetTranscript();
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          },
        }
      );
    }
  };
  
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      resetTranscript();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="agenda-item" className="text-base font-medium">
          Add an agenda item
        </Label>
        <div className="relative">
          <Textarea
            id="agenda-item"
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to discuss? Add your agenda item here..."
            className="min-h-[120px] resize-y pr-12"
            aria-label="Agenda item content"
            disabled={isPending}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={toggleVoiceInput}
                  aria-label={isListening ? "Stop voice input" : "Start voice input (accessibility feature)"}
                  disabled={!!voiceError}
                >
                  {isListening ? 
                    <MicOffIcon className="h-5 w-5 text-red-500" /> : 
                    <MicIcon className="h-5 w-5" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isListening ? "Stop voice input" : "Use voice to text"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isListening && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400 animate-pulse flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Listening... speak now
          </div>
        )}
        {voiceError && (
          <div className="text-sm text-red-500">
            {voiceError}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            aria-label="Submit anonymously"
          />
          <Label htmlFor="anonymous" className="text-sm cursor-pointer">
            Submit anonymously
          </Label>
        </div>
        
        <Button
          type="submit"
          disabled={!content.trim() || isPending}
          aria-busy={isPending}
          className="flex items-center gap-2"
        >
          <SendIcon className="h-4 w-4" />
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

interface AgendaItemsListProps {
  items: AgendaItem[];
  threadId: string;
  isAdmin: boolean;
}

/**
 * Component to display a list of agenda items
 */
export const AgendaItemsList: React.FC<AgendaItemsListProps> = ({ items, threadId, isAdmin }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg text-muted-foreground">
        <h3 className="text-lg font-medium mb-2">No agenda items yet</h3>
        <p>Be the first to add a topic for discussion!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <AgendaItemCard
          key={item.id}
          item={item}
          threadId={threadId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};