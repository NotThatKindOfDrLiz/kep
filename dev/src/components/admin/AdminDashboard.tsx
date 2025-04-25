/**
 * Admin Dashboard Components
 * 
 * These components allow admins to manage agenda threads,
 * configure settings, and moderate submitted items.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNostr } from '@nostrify/react';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { 
  useCurrentAgendaThread,
  useAgendaItems,
  useAdminConfig
} from '@/hooks/useAgenda';
import { createAdminConfigTemplate } from '@/lib/nostr/agenda';
import { AgendaItem } from '@/types';

/**
 * Main admin dashboard component
 */
export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');
  
  return (
    <div className="container max-w-5xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="items">Agenda Items</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-6">
          <ItemsManagement />
        </TabsContent>
        
        <TabsContent value="threads" className="space-y-6">
          <ThreadsManagement />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <SettingsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Component for managing agenda items
 */
const ItemsManagement: React.FC = () => {
  const { data: currentThread, isLoading: isLoadingThread } = useCurrentAgendaThread();
  const { data: items = [], isLoading: isLoadingItems } = useAgendaItems(
    currentThread?.id || ''
  );
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('priority');
  const [filterStarred, setFilterStarred] = useState(false);
  
  // Sort items based on the selected sort order
  const sortedItems = [...items].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.createdAt - a.createdAt;
    } else if (sortOrder === 'oldest') {
      return a.createdAt - b.createdAt;
    } else {
      // Sort by priority, with undefined priorities at the end
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      return b.createdAt - a.createdAt;
    }
  });
  
  // Filter items if the starred filter is active
  const filteredItems = filterStarred 
    ? sortedItems.filter(item => item.starred) 
    : sortedItems;
  
  if (isLoadingThread || isLoadingItems) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!currentThread) {
    return (
      <div className="text-center py-8">
        <div className="text-lg mb-4">No active agenda thread found</div>
        <Button asChild>
          <a href="/">Create a new agenda thread</a>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md">
        <div>
          <h2 className="text-xl font-semibold">{currentThread.title}</h2>
          <div className="text-sm text-gray-500">
            {format(currentThread.startDate, 'MMMM d')} - {format(currentThread.endDate, 'MMMM d')}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="sort-order" className="text-sm whitespace-nowrap">Sort by:</Label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-sm rounded-md border border-input bg-background px-3 py-1"
            >
              <option value="priority">Priority</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="filter-starred"
              checked={filterStarred}
              onCheckedChange={setFilterStarred}
            />
            <Label htmlFor="filter-starred" className="text-sm">
              Show starred only
            </Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <AdminItemCard key={item.id} item={item} threadId={currentThread.id} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No{filterStarred ? ' starred' : ''} agenda items found.
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Card for displaying and managing a single agenda item in the admin view
 */
const AdminItemCard: React.FC<{ item: AgendaItem; threadId: string }> = ({ item, threadId }) => {
  const { mutate: updateItem } = useNostrPublish();
  
  const handleToggleStar = () => {
    updateItem({
      kind: 1,
      content: item.content,
      tags: [
        ['thread', threadId],
        ['t', 'kep-agenda-item'],
        ['anonymous', item.isAnonymous ? 'true' : 'false'],
        ['priority', item.priority?.toString() || '999'],
        ['starred', item.starred ? 'false' : 'true'],
      ],
    });
  };
  
  const handleUpdatePriority = (newPriority: number) => {
    updateItem({
      kind: 1,
      content: item.content,
      tags: [
        ['thread', threadId],
        ['t', 'kep-agenda-item'],
        ['anonymous', item.isAnonymous ? 'true' : 'false'],
        ['priority', newPriority.toString()],
        ['starred', item.starred ? 'true' : 'false'],
      ],
    });
  };
  
  return (
    <Card className={`w-full ${item.starred ? 'border-yellow-400' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center">
          <button 
            onClick={handleToggleStar}
            className={`mr-2 ${item.starred ? 'text-yellow-500' : 'text-gray-400'}`}
            aria-label={item.starred ? "Unstar item" : "Star item"}
          >
            {item.starred ? '★' : '☆'}
          </button>
          
          <div>
            <div className="text-xs text-gray-500">
              {item.isAnonymous ? 'Anonymous' : item.submittedBy?.name || 'Unknown user'}
            </div>
            <div className="text-xs text-gray-400">
              {format(item.createdAt * 1000, 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm mr-2">
            Priority: {item.priority || 'None'}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdatePriority(item.priority ? item.priority - 1 : 1)}
            aria-label="Increase priority"
          >
            ↑
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdatePriority(item.priority ? item.priority + 1 : 999)}
            aria-label="Decrease priority"
          >
            ↓
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap">{item.content}</p>
      </CardContent>
    </Card>
  );
};

/**
 * Component for managing agenda threads
 */
const ThreadsManagement: React.FC = () => {
  // Placeholder for thread management UI
  // In a more complete implementation, this would allow admins to:
  // - View past threads
  // - Create new threads
  // - Archive threads
  // - Schedule future threads
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thread Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Thread management functionality will be expanded in future versions.</p>
        <p>For now, threads are automatically created weekly.</p>
        
        <div className="mt-4">
          <Button asChild>
            <a href="/">Return to Current Thread</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component for managing admin settings
 */
const SettingsManagement: React.FC = () => {
  const { nostr } = useNostr();
  const { data: adminConfig, isLoading } = useAdminConfig();
  const { mutate: publishEvent } = useNostrPublish();
  
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [defaultRelay, setDefaultRelay] = useState('');
  const [additionalRelay, setAdditionalRelay] = useState('');
  const [additionalRelays, setAdditionalRelays] = useState<string[]>([]);
  const [autoCreate, setAutoCreate] = useState(true);
  const [showByDefault, setShowByDefault] = useState(true);
  
  // Initialize form with current values when data is loaded
  React.useEffect(() => {
    if (adminConfig) {
      setAdmins(adminConfig.admins);
      setDefaultRelay(adminConfig.defaultRelay);
      setAdditionalRelays(adminConfig.additionalRelays);
      setAutoCreate(adminConfig.threadAutoCreation);
      setShowByDefault(adminConfig.showSubmissionsByDefault);
    }
  }, [adminConfig]);
  
  const handleAddAdmin = () => {
    if (newAdmin.trim() && !admins.includes(newAdmin.trim())) {
      setAdmins([...admins, newAdmin.trim()]);
      setNewAdmin('');
    }
  };
  
  const handleRemoveAdmin = (admin: string) => {
    setAdmins(admins.filter(a => a !== admin));
  };
  
  const handleAddRelay = () => {
    if (additionalRelay.trim() && !additionalRelays.includes(additionalRelay.trim())) {
      setAdditionalRelays([...additionalRelays, additionalRelay.trim()]);
      setAdditionalRelay('');
    }
  };
  
  const handleRemoveRelay = (relay: string) => {
    setAdditionalRelays(additionalRelays.filter(r => r !== relay));
  };
  
  const handleSaveSettings = () => {
    const configTemplate = createAdminConfigTemplate(
      admins,
      defaultRelay,
      additionalRelays
    );
    
    // Add the content with additional boolean settings
    const content = JSON.stringify({
      threadAutoCreation: autoCreate,
      showSubmissionsByDefault: showByDefault,
    });
    
    publishEvent({
      kind: configTemplate.kind!,
      content,
      tags: configTemplate.tags!,
    });
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Admin Access</h3>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="new-admin">Add Administrator (by public key)</Label>
            <div className="flex gap-2">
              <Input
                id="new-admin"
                placeholder="npub..."
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
              />
              <Button onClick={handleAddAdmin}>Add</Button>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Current Administrators:</h4>
            {admins.length > 0 ? (
              <ul className="space-y-2">
                {admins.map((admin) => (
                  <li key={admin} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-sm truncate max-w-[80%]">{admin}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveAdmin(admin)}
                      aria-label="Remove admin"
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No administrators defined.</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Relay Configuration</h3>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="default-relay">Default Relay</Label>
            <Input
              id="default-relay"
              placeholder="wss://..."
              value={defaultRelay}
              onChange={(e) => setDefaultRelay(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="additional-relay">Additional Relays</Label>
            <div className="flex gap-2">
              <Input
                id="additional-relay"
                placeholder="wss://..."
                value={additionalRelay}
                onChange={(e) => setAdditionalRelay(e.target.value)}
              />
              <Button onClick={handleAddRelay}>Add</Button>
            </div>
          </div>
          
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Current Additional Relays:</h4>
            {additionalRelays.length > 0 ? (
              <ul className="space-y-2">
                {additionalRelays.map((relay) => (
                  <li key={relay} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="text-sm truncate max-w-[80%]">{relay}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRelay(relay)}
                      aria-label="Remove relay"
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No additional relays defined.</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">General Settings</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-create"
              checked={autoCreate}
              onCheckedChange={setAutoCreate}
            />
            <Label htmlFor="auto-create">
              Automatically create weekly agenda threads
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-default"
              checked={showByDefault}
              onCheckedChange={setShowByDefault}
            />
            <Label htmlFor="show-default">
              Show submissions to all participants by default
            </Label>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};