/**
 * Nostr Utility Functions
 * 
 * This file contains utilities for working with Nostr events specific to Kep,
 * including creating, querying, and parsing agenda-related events.
 */

import { NostrEvent } from '@nostrify/nostrify';
import { 
  AgendaItem, 
  AgendaThread, 
  NostrAgendaItem,
  NostrAgendaThread,
  AdminConfig 
} from '@/types';

/**
 * Constants for Kep's Nostr usage
 */
export const KEP_EVENT_KINDS = {
  TEXT_NOTE: 1,
  AGENDA_THREAD: 30001, // Parameterized replaceable event
  APPLICATION_CONFIG: 30002, // Application-specific configuration
};

export const KEP_TAGS = {
  AGENDA_ITEM: ['t', 'kep-agenda-item'],
  AGENDA_THREAD: ['t', 'kep-agenda-thread'],
  CONFIG: ['d', 'kep-config'],
};

/**
 * Generate a new thread ID for the current week
 */
export function generateThreadId(): string {
  const now = new Date();
  const weekStart = getWeekStart(now);
  return `thread-${weekStart.toISOString().slice(0, 10)}`;
}

/**
 * Get the start date of the week containing the given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the end date of the week (7 days after the start)
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Create an agenda thread event template
 */
export function createAgendaThreadTemplate(
  title: string,
  description: string = '',
): Partial<NostrAgendaThread> {
  const threadId = generateThreadId();
  const startDate = getWeekStart(new Date());
  const endDate = getWeekEnd(startDate);

  return {
    kind: KEP_EVENT_KINDS.AGENDA_THREAD,
    content: description,
    tags: [
      ['d', threadId], // Unique identifier
      ['title', title],
      ['start', startDate.toISOString()],
      ['end', endDate.toISOString()],
      KEP_TAGS.AGENDA_THREAD,
      ['show', 'true'], // Whether submissions are visible to all
    ],
  };
}

/**
 * Create an agenda item event template
 */
export function createAgendaItemTemplate(
  threadId: string, 
  content: string,
  isAnonymous: boolean = false,
): Partial<NostrAgendaItem> {
  return {
    kind: KEP_EVENT_KINDS.TEXT_NOTE,
    content,
    tags: [
      ['thread', threadId], // Which thread this item belongs to
      KEP_TAGS.AGENDA_ITEM,
      ['anonymous', isAnonymous ? 'true' : 'false'],
    ],
  };
}

/**
 * Create admin config event template
 */
export function createAdminConfigTemplate(
  admins: string[] = [],
  defaultRelay: string = '',
  additionalRelays: string[] = [],
): Partial<NostrEvent> {
  return {
    kind: KEP_EVENT_KINDS.APPLICATION_CONFIG,
    content: JSON.stringify({
      threadAutoCreation: true,
      showSubmissionsByDefault: true,
    }),
    tags: [
      KEP_TAGS.CONFIG, // Identifies this as a Kep config
      ['admins', ...admins], // List of admin pubkeys
      ['relay', defaultRelay], // Primary relay
      ...additionalRelays.map(relay => ['relay', relay]), // Additional relays
    ],
  };
}

/**
 * Parse a Nostr event into an AgendaItem
 */
export function parseAgendaItem(event: NostrEvent): AgendaItem {
  const threadTag = event.tags.find(tag => tag[0] === 'thread');
  const anonymousTag = event.tags.find(tag => tag[0] === 'anonymous');
  const priorityTag = event.tags.find(tag => tag[0] === 'priority');
  const starredTag = event.tags.find(tag => tag[0] === 'starred');
  
  const isAnonymous = anonymousTag ? anonymousTag[1] === 'true' : false;
  
  return {
    id: event.id,
    content: event.content,
    submittedBy: isAnonymous ? undefined : { pubkey: event.pubkey },
    createdAt: event.created_at,
    isAnonymous,
    priority: priorityTag ? parseInt(priorityTag[1], 10) : undefined,
    starred: starredTag ? starredTag[1] === 'true' : false,
  };
}

/**
 * Parse a Nostr event into an AgendaThread
 */
export function parseAgendaThread(event: NostrEvent): AgendaThread {
  const dTag = event.tags.find(tag => tag[0] === 'd');
  const titleTag = event.tags.find(tag => tag[0] === 'title');
  const startTag = event.tags.find(tag => tag[0] === 'start');
  const endTag = event.tags.find(tag => tag[0] === 'end');
  const showTag = event.tags.find(tag => tag[0] === 'show');
  
  return {
    id: dTag ? dTag[1] : event.id,
    title: titleTag ? titleTag[1] : 'Unnamed Thread',
    startDate: startTag ? new Date(startTag[1]) : new Date(),
    endDate: endTag ? new Date(endTag[1]) : new Date(),
    description: event.content,
    items: [],
    isActive: true, // Will be determined based on dates
    showSubmissions: showTag ? showTag[1] === 'true' : true,
  };
}

/**
 * Parse a Nostr event into an AdminConfig
 */
export function parseAdminConfig(event: NostrEvent): AdminConfig {
  const adminTags = event.tags.filter(tag => tag[0] === 'admins');
  const relayTags = event.tags.filter(tag => tag[0] === 'relay');
  
  // Parse the content JSON if available
  let contentObj = {};
  try {
    if (event.content) {
      contentObj = JSON.parse(event.content);
    }
  } catch (e) {
    console.error('Error parsing admin config content:', e);
  }
  
  return {
    admins: adminTags.length ? adminTags[0].slice(1) : [],
    defaultRelay: relayTags.length ? relayTags[0][1] : '',
    additionalRelays: relayTags.slice(1).map(tag => tag[1]),
    threadAutoCreation: contentObj.threadAutoCreation || true,
    showSubmissionsByDefault: contentObj.showSubmissionsByDefault || true,
  };
}

/**
 * Check if a user is an admin based on the config
 */
export function isUserAdmin(userPubkey: string, config: AdminConfig): boolean {
  return config.admins.includes(userPubkey);
}

/**
 * Build a Nostr filter to query agenda threads
 */
export function buildAgendaThreadFilter() {
  return {
    kinds: [KEP_EVENT_KINDS.AGENDA_THREAD],
    "#t": ["kep-agenda-thread"],
  };
}

/**
 * Build a Nostr filter to query agenda items for a specific thread
 */
export function buildAgendaItemsFilter(threadId: string) {
  return {
    kinds: [KEP_EVENT_KINDS.TEXT_NOTE],
    "#thread": [threadId],
    "#t": ["kep-agenda-item"],
  };
}

/**
 * Build a Nostr filter to query the admin configuration
 */
export function buildAdminConfigFilter() {
  return {
    kinds: [KEP_EVENT_KINDS.APPLICATION_CONFIG],
    "#d": ["kep-config"],
  };
}