import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useCurrentUser, User } from '../../hooks/useCurrentUser';

export const LoginArea: React.FC = () => {
  const { user, setUser } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleLogin = () => {
    // In a real implementation, this would open a login dialog
    // and authenticate with Nostr
    
    // For demonstration purposes, create a mock user
    const mockUser: User = {
      id: 'mock-user-id',
      pubkey: 'mock-public-key',
      displayName: 'Demo User',
    };
    
    setUser(mockUser);
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{user.displayName || 'Anonymous'}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    );
  }
  
  return (
    <Button variant="default" size="sm" onClick={handleLogin}>
      Log in
    </Button>
  );
};