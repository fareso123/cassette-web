'use client';

import { ThemeController } from './ThemeController';

export function Navbar() {
  return (
    <nav aria-label="Main" className="border-border bg-background font-mono border-b">
      {/* Top thin strip */}
      <div className="text-muted-foreground flex items-center justify-between px-6 py-1 text-[10px] tracking-[0.2em]">
        <div className="flex items-center gap-4">
          <span translate="no">MUSIC PLAYER</span>
          <span className="opacity-50">·</span>
          <span>RECORD START</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">TYPE 1 NORMAL POSITION</span>
          <ThemeController />
        </div>
      </div>

      {/* Main nav bar. No logo mark yet — one is being designed. */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span
            className="text-muted-foreground border-border flex size-9 items-center justify-center border border-dashed text-[10px]"
            aria-hidden="true"
          >
            LOGO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground mr-2 hidden text-[10px] tracking-[0.15em] md:inline">
            LOUNDEX
          </span>
        </div>
      </div>

      {/* Decorative divider line with playback arrows */}
      <div className="flex items-center gap-3 px-6 pb-1">
        <span className="playback-arrows select-none" aria-hidden="true">
          ◄◄
        </span>
        <span className="tech-divider flex-1 py-0 opacity-100">
          Search · Resolve · Download
        </span>
        <span className="playback-arrows select-none" aria-hidden="true">
          ►►
        </span>
      </div>
    </nav>
  );
}
