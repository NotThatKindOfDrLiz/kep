/**
 * Accessibility Utilities
 * 
 * This file contains functionality to enhance the accessibility of the application.
 * It includes utilities for handling keyboard navigation, screen readers, and other
 * accessibility features.
 */

import { useEffect, useState } from 'react';
import { AccessibilityPreference } from '@/types';

/**
 * Check if the user prefers reduced motion based on system settings
 */
export function usePreferReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Check if the user prefers high contrast based on system settings
 */
export function usePreferHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(
    window.matchMedia('(prefers-contrast: more)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    const handleChange = () => {
      setPrefersHighContrast(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersHighContrast;
}

/**
 * Set up voice recognition for input
 */
export function useVoiceToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support voice recognition.');
      return;
    }

    // Initialize the SpeechRecognition object
    // @ts-ignore - TS doesn't have these types by default
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure the recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set up event handlers
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      setError(`Error occurred in voice recognition: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      setTranscript(transcriptResult);
    };

    // Start/stop listening based on state
    if (isListening) {
      try {
        recognition.start();
      } catch (err) {
        setError('Error starting voice recognition.');
      }
    }
    
    // Cleanup
    return () => {
      try {
        recognition.stop();
      } catch (err) {
        // Ignore errors when stopping
      }
    };
  }, [isListening]);

  // Return controls for the voice recognition
  const startListening = () => setIsListening(true);
  const stopListening = () => setIsListening(false);
  const resetTranscript = () => setTranscript('');

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

/**
 * Add ARIA attributes to an element for screen readers
 */
export function withAriaAttributes(props: Record<string, any>) {
  // Common ARIA attributes to enhance accessibility
  return {
    role: props.role,
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    'aria-hidden': props['aria-hidden'],
    'aria-live': props['aria-live'],
    'aria-atomic': props['aria-atomic'],
    // Include all other props
    ...props,
  };
}

/**
 * Hook to manage user accessibility preferences
 */
export function useAccessibilitySettings() {
  // Get or initialize preferences from localStorage
  const getInitialPreferences = (): AccessibilityPreference[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('accessibilityPreferences');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading accessibility preferences:', error);
      return [];
    }
  };

  const [preferences, setPreferences] = useState<AccessibilityPreference[]>(getInitialPreferences);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
    }
  }, [preferences]);

  // Toggle a preference on/off
  const togglePreference = (preference: AccessibilityPreference) => {
    setPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  // Check if a preference is enabled
  const hasPreference = (preference: AccessibilityPreference) => {
    return preferences.includes(preference);
  };

  return {
    preferences,
    togglePreference,
    hasPreference,
  };
}

/**
 * Get dynamic classes based on accessibility preferences
 */
export function getAccessibilityClasses(preferences: AccessibilityPreference[]) {
  const classes = [];
  
  if (preferences.includes(AccessibilityPreference.HighContrast)) {
    classes.push('high-contrast');
  }
  
  if (preferences.includes(AccessibilityPreference.LargerText)) {
    classes.push('text-lg');
  }
  
  return classes.join(' ');
}

/**
 * Hook to manage keyboard navigation
 */
export function useKeyboardNavigation(containerRef: React.RefObject<HTMLElement>) {
  // Listen for keyboard events to facilitate navigation
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Find all focusable elements
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // Handle Tab and Shift+Tab navigation
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef]);
}

// Re-export AccessibilityPreference for convenience
export { AccessibilityPreference };