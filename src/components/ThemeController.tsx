'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'theme-preference';
const LIGHT = 'light';
const DARK = 'dark';

function getInitialTheme(): string {
  if (typeof window === 'undefined') return 'cassette';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'cassette' || stored === 'cassette-light') return stored;
  return 'cassette';
}

export function ThemeController() {
  const [theme, setTheme] = useState<string>('cassette');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'cassette' ? 'cassette-light' : 'cassette'));
  }

  if (!mounted) {
    return (
      <button
        className="btn btn-ghost btn-circle btn-sm"
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label="Toggle theme"
      title={theme === 'cassette' ? 'Switch to light variant' : 'Switch to default cassette'}
    >
      {theme === 'cassette' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
