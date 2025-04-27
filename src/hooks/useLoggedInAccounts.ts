import { useState, useEffect } from 'react';
import { User } from './useCurrentUser';

export function useLoggedInAccounts() {
  const [accounts, setAccounts] = useState<User[]>([]);
  
  useEffect(() => {
    // In a real implementation, this would retrieve accounts from localStorage or elsewhere
    const storedAccounts = localStorage.getItem('loggedInAccounts');
    if (storedAccounts) {
      try {
        setAccounts(JSON.parse(storedAccounts));
      } catch (error) {
        console.error('Failed to parse stored accounts:', error);
      }
    }
  }, []);
  
  const addAccount = (account: User) => {
    setAccounts((prev) => {
      const newAccounts = [...prev.filter(a => a.id !== account.id), account];
      localStorage.setItem('loggedInAccounts', JSON.stringify(newAccounts));
      return newAccounts;
    });
  };
  
  const removeAccount = (accountId: string) => {
    setAccounts((prev) => {
      const newAccounts = prev.filter(a => a.id !== accountId);
      localStorage.setItem('loggedInAccounts', JSON.stringify(newAccounts));
      return newAccounts;
    });
  };
  
  return { accounts, addAccount, removeAccount };
}