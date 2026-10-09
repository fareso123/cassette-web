'use client';

import { ThemeController } from './ThemeController';

export function Navbar() {
  return (
    <nav aria-label="Main" className="border-border bg-background/80 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-end px-4">
        <ThemeController />
      </div>
    </nav>
  );
}