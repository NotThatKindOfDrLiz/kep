import { useState, useEffect } from 'react';
import { useNostr } from '../components/NostrProvider';

export interface User {
  id: string;
  pubkey: string;
  displayName?: string;
  profileImage?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isConnected } = useNostr();
  
  useEffect(() => {
    // Simulate loading user data
    const loadUser = async () => {
      setIsLoading(true);
      
      // This would typically check localStorage or another store for a saved user
      const savedUser = localStorage.getItem('currentUser');
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };
    
    if (isConnected) {
      loadUser();
    }
  }, [isConnected]);
  
  return {
    user,
    isLoading,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  };
}