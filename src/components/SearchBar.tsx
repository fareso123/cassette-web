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
  return (
    <form onSubmit={onSubmit} style={{ fontFamily: 'var(--font-mono)' }}>
      {/* Mode toggle */}
      <div className="flex gap-0 mb-4 border border-base-content/20">
        <button
          type="button"
          onClick={() => onTypeChange('song')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors ${
            type === 'song'
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/60 hover:bg-base-200'
          }`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Music className="w-3.5 h-3.5" />
          Song Name
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest transition-colors border-l border-base-content/20 ${
            type === 'url'
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 text-base-content/60 hover:bg-base-200'
          }`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Link2 className="w-3.5 h-3.5" />
          YouTube URL
        </button>
      </div>

      {/* Search input + submit */}
      <div className="flex gap-0">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={type === 'url' ? 'https://youtube.com/...' : 'Enter song title...'}
            className="w-full bg-base-100 border border-base-content/20 pl-10 pr-4 py-3 text-sm uppercase tracking-wider placeholder:text-base-content/30 focus:outline-none focus:border-primary"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary px-6 normal-case tracking-widest shrink-0"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            border: 'none',
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              SEARCHING
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              SEARCH
            </>
          )}
        </button>
      </div>
    </form>
  );
}
