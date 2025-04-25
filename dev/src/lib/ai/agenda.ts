/**
 * AI Utilities for Agenda Processing
 * 
 * This file contains functions for AI-powered features like grouping similar
 * agenda items and suggesting section titles.
 * 
 * Note: In a real implementation, these functions would call external AI APIs.
 * For this MVP prototype, we're using basic text processing as placeholders.
 */

import { AgendaItem, AIGrouping } from '@/types';

/**
 * Groups similar agenda items based on content similarity.
 * 
 * Note: This is a placeholder implementation. In production, this would use
 * a real NLP API or ML model for more sophisticated grouping.
 */
export function groupSimilarItems(items: AgendaItem[]): AIGrouping[] {
  // For the prototype, we'll group by common keywords and phrases
  const groups: Record<string, AgendaItem[]> = {};
  
  // Simple keyword extraction for grouping (a placeholder for real NLP)
  items.forEach(item => {
    // Convert to lowercase and remove punctuation
    const content = item.content.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    
    // Look for common keywords that could indicate categories
    let category = '';
    
    if (content.includes('feature') || content.includes('product') || content.includes('roadmap')) {
      category = 'Product & Features';
    } else if (content.includes('bug') || content.includes('fix') || content.includes('issue')) {
      category = 'Bugs & Issues';
    } else if (content.includes('team') || content.includes('hire') || content.includes('staff')) {
      category = 'Team & Hiring';
    } else if (content.includes('customer') || content.includes('user') || content.includes('client')) {
      category = 'Customer Feedback';
    } else if (content.includes('timeline') || content.includes('deadline') || content.includes('schedule')) {
      category = 'Timelines & Scheduling';
    } else if (content.includes('budget') || content.includes('cost') || content.includes('expense')) {
      category = 'Budget & Finances';
    } else if (content.includes('announce') || content.includes('marketing') || content.includes('launch')) {
      category = 'Marketing & Announcements';
    } else {
      category = 'Other Topics';
    }
    
    // Add to the appropriate group
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(item);
  });
  
  // Convert the groups into the expected format
  return Object.entries(groups).map(([title, groupItems]) => ({
    title,
    items: groupItems
  }));
}

/**
 * Suggests a title for a group of agenda items.
 * 
 * Note: This is a placeholder implementation. In production, this would use
 * a real AI API for more sophisticated title generation.
 */
export function suggestGroupTitle(items: AgendaItem[]): string {
  // For the prototype, we'll just analyze the most frequent words
  const wordFrequency: Record<string, number> = {};
  const commonWords = new Set([
    'the', 'and', 'a', 'to', 'in', 'of', 'for', 'is', 'on', 'that', 'with',
    'this', 'we', 'our', 'are', 'be', 'as', 'by', 'an', 'it', 'can', 'from',
    'have', 'should', 'would', 'could', 'i', 'we', 'they', 'need', 'want'
  ]);
  
  // Extract words from all items
  items.forEach(item => {
    const words = item.content
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !commonWords.has(word)); // Filter out short and common words
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });
  
  // Find the most frequent words
  const topWords = Object.entries(wordFrequency)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([word]) => word);
  
  // If we have meaningful top words, create a title
  if (topWords.length > 0) {
    // Capitalize the words
    const capitalizedWords = topWords.map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    );
    
    return capitalizedWords.join(' & ');
  }
  
  // Fallback title
  return 'Discussion Topics';
}

/**
 * Summarizes the content of agenda items.
 * 
 * Note: This is a placeholder implementation. In production, this would use
 * a real summarization API.
 */
export function summarizeAgendaItems(items: AgendaItem[]): string {
  if (items.length === 0) return '';
  
  // For the prototype, we'll simply concatenate the first sentence of each item
  const summaries = items.map(item => {
    // Extract the first sentence, or the first 100 characters
    const firstSentenceMatch = item.content.match(/^.*?[.!?](?:\s|$)/);
    if (firstSentenceMatch) {
      return firstSentenceMatch[0].trim();
    } else {
      return item.content.slice(0, 100) + (item.content.length > 100 ? '...' : '');
    }
  });
  
  // Join the summaries into a single paragraph
  return summaries.join(' ');
}