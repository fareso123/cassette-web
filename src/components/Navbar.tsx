'use client';

import Link from 'next/link';
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

      {/* Main nav bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {/* Cassette icon */}
          <svg
            width="28"
            height="18"
            viewBox="0 0 28 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <rect x="0.75" y="0.75" width="26.5" height="16.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="19" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="0.75" y1="5.5" x2="27.25" y2="5.5" stroke="currentColor" strokeWidth="1" />
            <line x1="0.75" y1="12.5" x2="27.25" y2="12.5" stroke="currentColor" strokeWidth="1" />
            <rect x="10" y="1.5" width="8" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display text-lg leading-none font-bold tracking-tight">
              <span translate="no">COUNDEX</span>
            </span>
            <span className="text-muted-foreground text-[9px] tracking-[0.2em]">
              HF-S 800
            </span>
          </div>
        </Link>

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
