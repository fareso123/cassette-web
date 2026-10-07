'use client';

import { Music, Disc } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden font-mono"
      aria-labelledby="hero-heading"
    >
      {/* Giant background letter */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="leading-none tracking-tighter opacity-[0.06]"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(14rem, 36vw, 36rem)',
          }}
        >
          C
        </span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Sub header */}
          <div className="text-[10px] uppercase tracking-[0.3em] text-base-content/60 mb-6">
            ◄◄&nbsp;&nbsp;Search across every source&nbsp;&nbsp;►►
          </div>

          {/* Main logo */}
          <div className="relative inline-flex flex-col items-center mb-6">
            {/* Decorative loop; stops under prefers-reduced-motion */}
            <Disc
              className="absolute w-48 h-48 text-primary/10 spin-slow motion-reduce:animate-none"
              aria-hidden="true"
            />
            <Music className="w-12 h-12 text-primary mb-3 relative z-10" aria-hidden="true" />
            <h1
              id="hero-heading"
              className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none text-balance"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.04em',
                color: 'var(--c-text)',
              }}
            >
              <span translate="no">COUNDEX</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-sm uppercase tracking-[0.25em] text-base-content/60 mb-10 text-pretty">
            Music search engine
          </p>

          {/* Source badges */}
          <ul className="flex flex-wrap items-center justify-center gap-2 mb-2 list-none p-0">
            {[
              { label: 'YouTube', color: 'bg-primary' },
              { label: 'Torrents', color: 'bg-secondary' },
              { label: 'MP3 Sites', color: 'bg-accent' },
            ].map((source) => (
              <li
                key={source.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-base-content/20 text-[10px] uppercase tracking-[0.2em] text-base-content/70"
              >
                <span className={`w-1.5 h-1.5 ${source.color} inline-block`} aria-hidden="true" />
                <span translate="no">{source.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
