import { useNostr } from './useNostr';
import { useState, useEffect } from 'react';

interface AuthorProfile {
  displayName?: string;
  about?: string;
  picture?: string;
  pubkey: string;
  nip05?: string;
}

export function useAuthor(pubkey: string | undefined) {
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { nostr } = useNostr();

  useEffect(() => {
    if (!pubkey) {
      setProfile(null);
      return;
    }

    const fetchAuthorProfile = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would query for kind:0 metadata events
        // and possibly kind:1 events to build a profile
        // Stub implementation just returns a basic profile
        
        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProfile({
          pubkey,
          displayName: `User ${pubkey.slice(0, 6)}`,
          about: 'No profile information available',
        });
      } catch (error) {
        console.error('Failed to fetch author profile:', error);
        setProfile({
          pubkey,
          displayName: `User ${pubkey.slice(0, 6)}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthorProfile();
  }, [pubkey, nostr]);

  return {
    profile,
    isLoading,
  };
}