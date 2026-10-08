'use client';

import { Music, Disc } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden py-16 font-mono md:py-24"
      aria-labelledby="hero-heading"
    >
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center">
          {/* Sub header */}
          <div className="text-muted-foreground mb-6 text-[10px] tracking-[0.3em]">
            ◄◄&nbsp;&nbsp;Search across every source&nbsp;&nbsp;►►
          </div>

          {/* Main logo */}
          <div className="relative mb-6 inline-flex flex-col items-center">
            {/* Decorative loop; stops under prefers-reduced-motion */}
            <Disc
              className="spin-slow text-primary/10 absolute size-48 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <Music
              className="text-primary relative z-10 mb-3 size-12"
              aria-hidden="true"
            />
            <h1
              id="hero-heading"
              className="font-display text-5xl leading-none font-black tracking-tighter text-balance sm:text-7xl md:text-9xl"
            >
              <span translate="no">COUNDEX</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-muted-foreground mb-10 text-pretty text-sm tracking-[0.25em]">
            Music search engine
          </p>

          {/* Source badges */}
          <ul className="mb-2 flex list-none flex-wrap items-center justify-center gap-2 p-0">
            {[
              { label: 'YouTube', color: 'bg-primary' },
              { label: 'Torrents', color: 'bg-secondary' },
              { label: 'MP3 Sites', color: 'bg-accent' },
            ].map(source => (
              <li key={source.label}>
                <Badge
                  variant="outline"
                  className="text-muted-foreground gap-2 px-3 py-1.5 text-[10px] tracking-[0.2em]"
                >
                  <span
                    className={`${source.color} inline-block size-1.5`}
                    aria-hidden="true"
                  />
                  <span translate="no">{source.label}</span>
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
