'use client';

import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className="px-4 pt-14 pb-8 md:pt-20" aria-labelledby="hero-heading">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        {/* The single h1 on the page. No wordmark or logo art: branding is
            being designed separately. */}
        <h1
          id="hero-heading"
          className="font-display text-4xl leading-tight font-bold text-balance sm:text-5xl"
        >
          Find the music
        </h1>

        <p className="text-muted-foreground max-w-md text-pretty text-sm leading-relaxed sm:text-base">
          Search a song by name, or paste a YouTube link to resolve it to audio.
        </p>

        {/* What it searches. */}
        <ul className="flex list-none flex-wrap items-center justify-center gap-2 p-0">
          {[
            { label: 'YouTube', color: 'bg-primary' },
            { label: 'Torrents', color: 'bg-secondary' },
            { label: 'MP3 sites', color: 'bg-accent' },
          ].map(source => (
            <li key={source.label}>
              <Badge variant="secondary" className="gap-2 font-normal">
                <span
                  className={`${source.color} size-1.5 rounded-full`}
                  aria-hidden="true"
                />
                <span translate="no">{source.label}</span>
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
