/**
 * Header component with accessibility options
 */

import React from 'react';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  Monitor,  
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Volume2,
  VolumeX,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import LoginArea from '@/components/auth/LoginArea';
import { 
  useAccessibilitySettings,
  AccessibilityPreference 
} from '@/lib/accessibility';

/**
 * Main application header with theme controls and accessibility options
 */
export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { 
    preferences, 
    togglePreference, 
    hasPreference 
  } = useAccessibilitySettings();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo and title */}
        <div className="mr-4 flex items-center md:mr-6">
          <a href="/" className="flex items-center space-x-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl md:text-2xl">Kep</span>
          </a>
          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
            Collaborative Meeting Agendas
          </span>
        </div>
        
        {/* Navigation links - can be expanded in the future */}
        <nav className="flex flex-1">
          <ul className="flex gap-4 md:gap-6">
            <li>
              <a 
                href="/" 
                className="text-sm font-medium transition-colors hover:text-primary"
                aria-label="Home page"
              >
                Home
              </a>
            </li>
          </ul>
        </nav>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Accessibility Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                aria-label="Accessibility Options"
                className="rounded-full"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Accessibility options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === 'light' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === 'dark' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {theme === 'system' && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuItem 
                onClick={() => togglePreference(AccessibilityPreference.HighContrast)}
              >
                {hasPreference(AccessibilityPreference.HighContrast) ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    <span>Disable High Contrast</span>
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Enable High Contrast</span>
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => togglePreference(AccessibilityPreference.LargerText)}
              >
                {hasPreference(AccessibilityPreference.LargerText) ? (
                  <>
                    <ZoomOut className="mr-2 h-4 w-4" />
                    <span>Normal Text Size</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="mr-2 h-4 w-4" />
                    <span>Larger Text</span>
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => togglePreference(AccessibilityPreference.ReducedMotion)}
              >
                {hasPreference(AccessibilityPreference.ReducedMotion) ? (
                  <>
                    <span className="mr-2">🏃‍♂️</span>
                    <span>Normal Motion</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚶‍♂️</span>
                    <span>Reduce Motion</span>
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => togglePreference(AccessibilityPreference.ScreenReader)}
              >
                {hasPreference(AccessibilityPreference.ScreenReader) ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" />
                    <span>Standard Labels</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    <span>Enhanced Screen Reader Labels</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Login/User Menu */}
          <LoginArea />
        </div>
      </div>
    </header>
  );
};