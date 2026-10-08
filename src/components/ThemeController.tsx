'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/*
 * Theme state.
 *
 * shadcn's dark mode is a `.dark` class on <html> combined with
 * `@custom-variant dark (&:is(.dark *))` in globals.css. The previous daisyUI
 * themes were both light, so the old controller's Moon icon was a lie: you
 * pressed it and got cream. There is now a real dark canvas.
 *
 * The stored value is the dark/light preference, not a theme name, so adding a
 * third theme later does not need a migration of localStorage.
 */

const STORAGE_KEY = 'theme-preference';

type Theme = 'light' | 'dark';

const DEFAULT_THEME: Theme = 'light';

const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

// Server snapshot is the default theme, so the server render and the first
// client render always agree and React never reports a hydration mismatch.
// useSyncExternalStore also avoids setState-in-effect, which the
// react-hooks lint rules flag as a cascading render.
const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

const subscribeNoop = () => () => {};

export function ThemeController() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => DEFAULT_THEME);

  // mounted only gates the icon swap to avoid a hydration warning. Derive it
  // instead of setting state in an effect (react-hooks flags that as a
  // cascading render).
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const toggleTheme = useCallback(() => {
    const next = readStoredTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    // Storage events do not fire in the tab that wrote them.
    window.dispatchEvent(new Event('storage'));
  }, []);

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
    >
      {mounted && isDark ? (
        <Moon aria-hidden="true" />
      ) : (
        <Sun aria-hidden="true" />
      )}
    </Button>
  );
}
