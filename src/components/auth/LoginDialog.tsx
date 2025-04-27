import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onOpenChange,
  onLogin,
}) => {
  // Stub component for login dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login to Kep</DialogTitle>
          <DialogDescription>
            Connect with your Nostr account to post agenda items and participate in discussions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p>Login functionality will be implemented here.</p>
        </div>
        
        <DialogFooter>
          <Button onClick={onLogin}>
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};