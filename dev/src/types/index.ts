/**
 * Kep Type Definitions
 * 
 * This file contains all the TypeScript types used throughout the application. 
 * Centralizing types here makes it easier to maintain consistency.
 */

import { NostrEvent } from '@nostrify/nostrify';

export interface User {
  pubkey: string;
  name?: string;
  displayName?: string;
  picture?: string;
}

export interface AgendaItem {
  id: string;
  content: string;
  submittedBy?: User; // Optional for anonymous submissions
  createdAt: number;
  isAnonymous: boolean;
  priority?: number; // Used by admins for ordering
  starred?: boolean; // Used by admins for highlighting
}

export interface AgendaThread {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date; // Usually startDate + 7 days
  description?: string;
  items: AgendaItem[];
  isActive: boolean;
  showSubmissions: boolean; // Controls whether users can see other submissions
}

export interface NostrAgendaItem extends NostrEvent {
  kind: 1; // Plain text note
  tags: string[][]; // Will include ["t", "kep-agenda-item"], ["thread", threadId]
}

export interface NostrAgendaThread extends NostrEvent {
  kind: 30001; // Parameterized replaceable event
  tags: string[][]; // Will include ["d", threadId], ["title", title], ["description", description]
}

export interface NostrAgendaConfig extends NostrEvent {
  kind: 30001; // Parameterized replaceable event
  tags: string[][]; // Will include ["d", "kep-config"], ["admins", pubkey1, pubkey2, ...]
}

export interface AdminConfig {
  admins: string[]; // Array of admin pubkeys
  defaultRelay: string;
  additionalRelays: string[];
  threadAutoCreation: boolean; 
  showSubmissionsByDefault: boolean;
}

export interface AIGrouping {
  title: string;
  items: AgendaItem[];
}

export enum AccessibilityPreference {
  ReducedMotion = 'reducedMotion',
  HighContrast = 'highContrast',
  LargerText = 'largerText',
  ScreenReader = 'screenReader',
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  accessibility: AccessibilityPreference[];
  language: string;
  useAI: boolean;
}