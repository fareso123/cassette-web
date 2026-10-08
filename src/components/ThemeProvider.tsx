'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { cn } from '@/lib/utils';

/*
 * Dark mode ownership.
 *
 * This is a React-owned class on <html>, not an imperative write. An earlier
 * version called document.documentElement.classList.toggle() from the click
 * handler and React re-asserted the className prop it renders for <html>, so
 * toggling back to light silently did nothing. Rendering the class from state
 * makes the DOM a function of state and removes the write conflict entirely.
 *
 * The stored value is the dark/light preference rather than a theme name, so
 * adding a third theme later needs no localStorage migration.
 */

const STORAGE_KEY = 'theme-preference';

export type Theme = 'light' | 'dark';

const DEFAULT_THEME: Theme = 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: string | null): value is Theme =>
  value === 'dark' || value === 'light';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // Private browsing and blocked storage both throw on access.
    return DEFAULT_THEME;
  }
}

// The server snapshot is the default theme, so the server render and the first
// client render agree and React never reports a hydration mismatch. Cross-tab
// updates arrive through the real 'storage' event, which does not fire in the
// tab that wrote it — hence the manual dispatch in setTheme.
const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readStoredTheme,
    () => DEFAULT_THEME
  );

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A theme that cannot persist still applies for this page view.
    }
    window.dispatchEvent(new Event('storage'));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readStoredTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}

/** The class to place on <html>. Kept here so the toggle and document agree. */
export function themeClassName(theme: Theme): string {
  return cn(theme === 'dark' && 'dark');
}

/**
 * Applies the persisted preference before first paint so a dark-theme visitor
 * never sees a light flash. React owns the class after hydration and renders
 * the same value, so this is a seed rather than a second source of truth.
 */
export const themeInitScript = `try{if(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)})==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;
