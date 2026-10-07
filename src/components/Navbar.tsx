'use client';

import Link from 'next/link';
import { Music } from 'lucide-react';
import { ThemeController } from './ThemeController';

export function Navbar() {
  return (
    <nav
      aria-label="Main"
      className="border-b border-base-content/20 bg-base-100 paper-grain font-mono"
    >
      {/* Top thin strip */}
      <div className="flex items-center justify-between px-6 py-1 text-[10px] uppercase tracking-[0.2em] text-base-content/60">
        <div className="flex items-center gap-4">
          <span translate="no">MUSIC PLAYER</span>
          <span className="text-base-content/40">·</span>
          <span>RECORD START</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">TYPE 1 NORMAL POSITION</span>
          <ThemeController />
        </div>
      </div>

      {/* Main nav bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
            <span
              className="text-lg font-bold leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              <span translate="no">COUNDEX</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-base-content/60">
              HF-S 800
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] uppercase tracking-[0.15em] text-base-content/50 mr-2">
            LOUNDEX
          </span>
        </div>
      </div>

      {/* Decorative divider line with playback arrows */}
      <div className="px-6 flex items-center gap-3 pb-1">
        <span className="playback-arrows select-none" aria-hidden="true">
          ◄◄
        </span>
        <span className="tech-divider flex-1 !py-0 !opacity-100">
          Search · Resolve · Download
        </span>
        <span className="playback-arrows select-none" aria-hidden="true">
          ►►
        </span>
      </div>
    </nav>
  );
}
