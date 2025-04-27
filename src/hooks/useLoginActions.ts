import { useState } from 'react';
import { useCurrentUser, User } from './useCurrentUser';
import { useLoggedInAccounts } from './useLoggedInAccounts';

export function useLoginActions() {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const { setUser } = useCurrentUser();
  const { addAccount } = useLoggedInAccounts();
  
  const openLoginDialog = () => {
    setIsLoginDialogOpen(true);
  };
  
  const closeLoginDialog = () => {
    setIsLoginDialogOpen(false);
  };
  
  const openSignupDialog = () => {
    setIsSignupDialogOpen(true);
  };
  
  const closeSignupDialog = () => {
    setIsSignupDialogOpen(false);
  };
  
  const handleLogin = (userData: User) => {
    setUser(userData);
    addAccount(userData);
    closeLoginDialog();
  };
  
  const handleSignup = (userData: User) => {
    setUser(userData);
    addAccount(userData);
    closeSignupDialog();
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  return {
    isLoginDialogOpen,
    isSignupDialogOpen,
    openLoginDialog,
    closeLoginDialog,
    openSignupDialog,
    closeSignupDialog,
    handleLogin,
    handleSignup,
    handleLogout,
  };
}