import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignup: () => void;
}

export const SignupDialog: React.FC<SignupDialogProps> = ({
  open,
  onOpenChange,
  onSignup,
}) => {
  // Stub component for signup dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Nostr Account</DialogTitle>
          <DialogDescription>
            Create your Nostr key to start using Kep.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p>Signup functionality will be implemented here.</p>
        </div>
        
        <DialogFooter>
          <Button onClick={onSignup}>
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};