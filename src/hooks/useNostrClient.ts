import React, { useEffect, useState, useCallback } from 'react';
import { relayInit, getPublicKey, signEvent, getEventHash } from 'nostr-tools';
import { randomBytes, bytesToHex } from '@noble/hashes/utils';


const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://nostr.mom',
  'wss://relay.current.fyi',
];

interface AgendaItem {
  id: string;
  content: string;
  created_at: number;
}

export function useNostrClient() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [relays, setRelays] = useState<ReturnType<typeof relayInit>[]>([]);

  // Generate a random private key
  const privKey = bytesToHex(randomBytes(32));
  const pubKey = getPublicKey(privKey);

  useEffect(() => {
    // Connect to all relays
    const relayConnections = RELAYS.map(url => {
      const relay = relayInit(url);
      relay.on('connect', () => {
        console.log(`Connected to relay ${url}`);
      });
      relay.on('error', () => {
        console.error(`Failed to connect to relay ${url}`);
      });
      relay.connect();
      return relay;
    });
    setRelays(relayConnections);

    // Subscribe to agenda items
    relayConnections.forEach(relay => {
      const sub = relay.sub([
        {
          kinds: [1],
          "#t": [getCurrentISOWeek()],
        },
      ]);

      sub.on('event', (event: Event) => {
        console.log('Received event:', event);
        setItems(prev => {
          const exists = prev.some(item => item.id === event.id);
          if (exists) return prev;
          return [...prev, {
            id: event.id,
            content: event.content,
            created_at: event.created_at,
          }];
        });
      });
    });

    return () => {
      relayConnections.forEach(relay => relay.close());
    };
  }, []);

  const publishEvent = useCallback(async (content: string) => {
    const event: Event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', getCurrentISOWeek()]],
      content,
      pubkey: pubKey,
    };

    event.id = getEventHash(event);
    event.sig = signEvent(event, privKey);

    for (const relay of relays) {
      try {
        await relay.publish(event);
        console.log(`Published to ${relay.url}`);
      } catch (err) {
        console.error(`Failed to publish to ${relay.url}`, err);
      }
    }
  }, [relays, pubKey, privKey]);

  return { items, publishEvent };
}

// Utility function to calculate ISO Week tag
function getCurrentISOWeek(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOffset = (firstDay.getUTCDay() + 6) % 7;
  const firstMonday = new Date(firstDay);
  firstMonday.setUTCDate(firstDay.getUTCDate() - dayOffset + 1);
  const diff = now.getTime() - firstMonday.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${year}-W${week.toString().padStart(2, '0')}`;
}
