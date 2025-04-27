import { useTheme as useNextTheme } from 'next-themes';

/**
 * A hook for managing the application theme
 * Wraps next-themes functionality with a simplified interface
 */
export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  
  // Determine if dark mode is active
  const isDarkMode = 
    theme === 'dark' || 
    (theme === 'system' && systemTheme === 'dark');
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  return {
    theme,
    setTheme,
    isDarkMode,
    toggleTheme,
    systemTheme
  };
}