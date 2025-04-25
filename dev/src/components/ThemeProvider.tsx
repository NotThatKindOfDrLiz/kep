import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "system" | "dark" | "light";
  storageKey?: string;
}

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from 'next-themes'
