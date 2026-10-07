'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'theme-preference';
const DEFAULT_THEME = 'cassette';
const ALT_THEME = 'cassette-light';

const isTheme = (value: string | null): boolean =>
  value === DEFAULT_THEME || value === ALT_THEME;

function readStoredTheme(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? (stored as string) : DEFAULT_THEME;
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
    const next = readStoredTheme() === DEFAULT_THEME ? ALT_THEME : DEFAULT_THEME;
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
    // Storage events do not fire in the tab that wrote them.
    window.dispatchEvent(new Event('storage'));
  }, []);

  const label =
    theme === DEFAULT_THEME ? 'Switch to light theme' : 'Switch to default theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label={label}
      title={label}
      aria-pressed={theme === ALT_THEME}
    >
      {mounted && theme === ALT_THEME ? (
        <Moon className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Sun className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}
