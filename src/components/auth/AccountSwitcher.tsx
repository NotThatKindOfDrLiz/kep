import React from 'react';
import { useCurrentUser, User } from '../../hooks/useCurrentUser';
import { Button } from '../ui/button';

interface AccountSwitcherProps {
  accounts?: User[];
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ accounts = [] }) => {
  const { user, setUser } = useCurrentUser();
  
  // Stub component - in a real implementation, this would allow switching between accounts
  return (
    <div className="flex space-x-2">
      {user && (
        <Button variant="ghost" size="sm">
          {user.displayName || 'Anonymous'}
        </Button>
      )}
    </div>
  );
};