'use client';

import { Music, Disc } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Giant background letter */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-display text-[28rem] md:text-[36rem] leading-none tracking-tighter opacity-[0.06]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          C
        </span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Sub header */}
          <div
            className="text-[10px] uppercase tracking-[0.3em] text-base-content/50 mb-6"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ◄◄&nbsp;&nbsp;LIGHT, STYLISH, COMFORTABLE&nbsp;&nbsp;►►
          </div>

          {/* Main logo */}
          <div className="relative inline-flex flex-col items-center mb-6">
            <Disc
              className="absolute w-48 h-48 text-primary/10"
              aria-hidden="true"
              style={{ animation: 'spin 20s linear infinite' }}
            />
            <Music
              className="w-12 h-12 text-primary mb-3 relative z-10"
              aria-hidden="true"
            />
            <h1
              className="text-7xl md:text-9xl font-black tracking-tighter leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.04em',
                color: 'var(--c-text)',
              }}
            >
              COUNDEX
            </h1>
          </div>

          {/* Tagline */}
          <p
            className="text-sm uppercase tracking-[0.25em] text-base-content/50 mb-10"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            MUSIC SEARCH ENGINE · v2.0.1
          </p>

          {/* Source badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-base-content/20 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className="w-1.5 h-1.5 bg-primary inline-block" />
              YouTube
            </span>
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-base-content/20 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className="w-1.5 h-1.5 bg-secondary inline-block" />
              Torrents
            </span>
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-base-content/20 text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className="w-1.5 h-1.5 bg-accent inline-block" />
              MP3 Sites
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
