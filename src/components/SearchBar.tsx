'use client';

import { Search, Music, Link2, Loader2 } from 'lucide-react';

interface SearchBarProps {
  query: string;
  type: 'song' | 'url';
  loading: boolean;
  onQueryChange: (value: string) => void;
  onTypeChange: (type: 'song' | 'url') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchBar({
  query,
  type,
  loading,
  onQueryChange,
  onTypeChange,
  onSubmit,
}: SearchBarProps) {
  const isUrl = type === 'url';

  return (
    <form onSubmit={onSubmit} className="font-mono">
      {/* Mode toggle */}
      <div
        role="group"
        aria-label="Search mode"
        className="flex gap-0 mb-4 border border-base-content/20"
      >
        <button
          type="button"
          onClick={() => onTypeChange('song')}
          aria-pressed={!isUrl}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            !isUrl
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/60 hover:bg-base-200'
          }`}
        >
          <Music className="w-3.5 h-3.5" aria-hidden="true" />
          Song Name
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('url')}
          aria-pressed={isUrl}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors border-l border-base-content/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isUrl
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/60 hover:bg-base-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          YouTube URL
        </button>
      </div>

      {/* Search input + submit */}
      <div className="flex gap-0">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="search-query" className="sr-only">
            {isUrl ? 'YouTube URL' : 'Song name'}
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
            aria-hidden="true"
          />
          <input
            id="search-query"
            name="query"
            type={isUrl ? 'url' : 'search'}
            inputMode={isUrl ? 'url' : 'search'}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              isUrl ? 'https://youtube.com/watch?v=…' : 'Enter song title or artist…'
            }
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-hint"
            className="w-full bg-base-100 border border-base-content/20 pl-10 pr-4 py-3 text-sm tracking-wide placeholder:text-base-content/30 focus:outline-none focus-visible:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary px-6 tracking-widest shrink-0"
        >
          {loading ? (
            <>
              <Loader2
                className="w-3.5 h-3.5 motion-safe:animate-spin"
                aria-hidden="true"
              />
              SEARCHING
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              SEARCH
            </>
          )}
        </button>
      </div>

      <p
        id="search-hint"
        className="mt-2 text-[0.65rem] uppercase tracking-widest text-base-content/50"
      >
        {isUrl
          ? 'Paste a YouTube video or playlist link'
          : 'Search across YouTube, torrent sites, and MP3 sources'}
      </p>
    </form>
  );
}
