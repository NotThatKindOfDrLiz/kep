/**
 * Enhanced LoginArea component to handle Nostr authentication
 */

import React, { useState } from 'react';
import { 
  NostrEvent, 
  NSecSigner 
} from '@nostrify/nostrify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsAdmin } from '@/hooks/useAgenda';

// Define NostrSigner interface to match the expected shape
interface NostrSigner {
  getPublicKey: () => Promise<string>;
  signEvent: (event: NostrEvent) => Promise<NostrEvent>;
}

// Simple User class to match the expected usage
class User {
  pubkey: string;
  profile?: {
    name?: string;
    picture?: string;
  };
  signer: NostrSigner;

  constructor(pubkey: string, signer: NostrSigner, profile?: { name?: string; picture?: string }) {
    this.pubkey = pubkey;
    this.signer = signer;
    this.profile = profile;
  }

  // Static methods to create users
  static create(pubkey: string, signer: NostrSigner): User {
    return new User(pubkey, signer);
  }

  static fromSecretKey(nsec: string): User {
    const signer = new NSecSigner(nsec);
    return new User(signer.publicKey, signer);
  }

  static fromPublicKey(npub: string): User {
    // Read-only signer that can't sign events
    const signer: NostrSigner = {
      getPublicKey: async () => npub,
      signEvent: async () => {
        throw new Error("Can't sign events with a read-only account");
      },
    };
    return new User(npub, signer);
  }
}

const LoginArea: React.FC = () => {
  const { accounts } = useLoggedInAccounts();
  const { login, logout } = useLoginActions();
  const { user } = useCurrentUser();
  const { isAdmin } = useIsAdmin();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('extension');
  const [nsecInput, setNsecInput] = useState('');
  const [pubkeyInput, setPubkeyInput] = useState('');
  
  // Handle login with extension
  const handleExtensionLogin = async () => {
    try {
      // Trigger browser extension login flow
      const extensionSigner: NostrSigner = {
        async getPublicKey() {
          // Request public key from extension
          // @ts-ignore
          const pubkey = await window.nostr.getPublicKey();
          return pubkey;
        },
        async signEvent(event: NostrEvent) {
          // Request signature from extension
          // @ts-ignore
          const signedEvent = await window.nostr.signEvent(event);
          return signedEvent;
        },
      };
      
      if (extensionSigner) {
        const pubkey = await extensionSigner.getPublicKey();
        const user = User.create(pubkey, extensionSigner);
        login(user);
        setLoginDialogOpen(false);
      }
    } catch (error) {
      console.error('Extension login failed:', error);
      alert('Login failed. Is your Nostr extension installed and enabled?');
    }
  };
  
  // Handle login with nsec
  const handleNsecLogin = () => {
    try {
      if (!nsecInput.startsWith('nsec')) {
        throw new Error('Invalid nsec format');
      }
      
      // Create user from nsec
      const user = User.fromSecretKey(nsecInput);
      login(user);
      setNsecInput('');
      setLoginDialogOpen(false);
    } catch (error) {
      console.error('Nsec login failed:', error);
      alert('Invalid secret key. Please check and try again.');
    }
  };
  
  // Handle read-only login with pubkey
  const handlePubkeyLogin = () => {
    try {
      if (!pubkeyInput.startsWith('npub')) {
        throw new Error('Invalid npub format');
      }
      
      // Create a read-only user
      const user = User.fromPublicKey(pubkeyInput);
      login(user);
      setPubkeyInput('');
      setLoginDialogOpen(false);
    } catch (error) {
      console.error('Pubkey login failed:', error);
      alert('Invalid public key. Please check and try again.');
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (!user) {
    return (
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Log In</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log in with Nostr</DialogTitle>
            <DialogDescription>
              Choose a method to connect with your Nostr identity.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="extension">Extension</TabsTrigger>
              <TabsTrigger value="nsec">Secret Key</TabsTrigger>
              <TabsTrigger value="pubkey">Read Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="extension" className="space-y-4 py-2">
              <p className="text-sm text-gray-500">
                Use a Nostr browser extension like Nos2x or Alby.
              </p>
              <Button onClick={handleExtensionLogin} className="w-full">
                Connect with Extension
              </Button>
            </TabsContent>
            
            <TabsContent value="nsec" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="nsec">Your nsec key</Label>
                <Input
                  id="nsec"
                  value={nsecInput}
                  onChange={(e) => setNsecInput(e.target.value)}
                  placeholder="nsec1..."
                  type="password"
                />
                <p className="text-xs text-red-500">
                  Warning: This method should only be used in trusted environments.
                  Your private key will be stored in browser storage.
                </p>
              </div>
              <Button 
                onClick={handleNsecLogin} 
                disabled={!nsecInput.startsWith('nsec')}
                className="w-full"
              >
                Login with Secret Key
              </Button>
            </TabsContent>
            
            <TabsContent value="pubkey" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pubkey">Your public key (npub)</Label>
                <Input
                  id="pubkey"
                  value={pubkeyInput}
                  onChange={(e) => setPubkeyInput(e.target.value)}
                  placeholder="npub1..."
                />
                <p className="text-xs text-gray-500">
                  This is a read-only login. You won't be able to submit agenda items
                  but you can view existing content.
                </p>
              </div>
              <Button 
                onClick={handlePubkeyLogin} 
                disabled={!pubkeyInput.startsWith('npub')}
                className="w-full"
              >
                Login Read Only
              </Button>
            </TabsContent>
          </Tabs>
          
          {accounts.length > 0 && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    Recent accounts
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {accounts.map((account) => (
                  <Button
                    key={account.pubkey}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      login(account);
                      setLoginDialogOpen(false);
                    }}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={account.profile?.picture} />
                      <AvatarFallback>{getInitials(account.profile?.name)}</AvatarFallback>
                    </Avatar>
                    {account.profile?.name || account.pubkey.slice(0, 10) + '...'}
                  </Button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
  
  // User is logged in, show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile?.picture} />
            <AvatarFallback>{getInitials(user.profile?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.profile?.name || 'Nostr User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/">Home</a>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <a href="/admin">Admin Dashboard</a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setLoginDialogOpen(true);
          }}
        >
          Switch Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>Log Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LoginArea;