import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNostr } from '../hooks/useNostr';
import { XIcon, PlusIcon } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const RelayConfig = () => {
  const { nostr } = useNostr();
  const { toast } = useToast();
  const [newRelayUrl, setNewRelayUrl] = useState('');
  const [relays, setRelays] = useState(nostr?.relays || []);
  
  const handleAddRelay = async () => {
    if (!newRelayUrl.trim() || !newRelayUrl.startsWith('wss://')) {
      toast.error('Please enter a valid WebSocket URL starting with wss://');
      return;
    }
    
    try {
      await nostr.addRelay(newRelayUrl.trim());
      setRelays([...relays, newRelayUrl.trim()]);
      setNewRelayUrl('');
      toast.success(`Added relay: ${newRelayUrl.trim()}`);
    } catch (error) {
      toast.error(`Failed to add relay: ${error.message}`);
    }
  };
  
  const handleRemoveRelay = async (relay) => {
    try {
      await nostr.removeRelay(relay);
      setRelays(relays.filter(r => r !== relay));
      toast.success(`Removed relay: ${relay}`);
    } catch (error) {
      toast.error(`Failed to remove relay: ${error.message}`);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relay Configuration</CardTitle>
        <CardDescription>
          Connect to different Nostr relays to access different networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="wss://relay.example.com"
              value={newRelayUrl}
              onChange={(e) => setNewRelayUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddRelay} size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Relays</h3>
            
            {relays.length === 0 ? (
              <p className="text-sm text-gray-500">No relays configured</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {relays.map((relay) => (
                  <Badge key={relay} variant="secondary" className="flex items-center gap-1">
                    {relay}
                    <button 
                      onClick={() => handleRemoveRelay(relay)}
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                      aria-label={`Remove ${relay}`}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Multiple relays improve redundancy but may affect performance
      </CardFooter>
    </Card>
  );
};

export default RelayConfig;