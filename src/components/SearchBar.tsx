'use client';

import { Search, Music, Link2 } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
      {/*
        ToggleGroup replaces the old role="group" + aria-pressed pair. Base UI
        moves this between items with a single tab stop and arrow keys, where
        the previous markup made each button its own tab stop.
      */}
      {/*
        Base UI's ToggleGroup is always multi-select under the hood: `value`
        is an array even when `multiple` is false. Passing a single string
        coerces and TS rejects it, so the scalar prop state is bridged here.
      */}
      <ToggleGroup
        value={[type]}
        onValueChange={value => {
          const next = value[0];
          // Deselecting the active item would leave no mode at all, which
          // the search route cannot handle. Ignore an empty selection.
          if (next) onTypeChange(next as 'song' | 'url');
        }}
        variant="outline"
        className="mb-4 w-full"
      >
        <ToggleGroupItem value="song" className="flex-1 py-3 text-xs tracking-widest">
          <Music data-icon="inline-start" aria-hidden="true" />
          Song Name
        </ToggleGroupItem>
        <ToggleGroupItem value="url" className="flex-1 py-3 text-xs tracking-widest">
          <Link2 data-icon="inline-start" aria-hidden="true" />
          YouTube URL
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Search input + submit */}
      <InputGroup className="h-auto py-0">
        <InputGroupAddon>
          <Search aria-hidden="true" className="text-muted-foreground" />
        </InputGroupAddon>

        {/*
          type is always "search". The old markup set type="url" in URL mode,
          which made the browser block submission through native constraint
          validation and show its own bubble instead of the app's role="alert"
          region. inputMode still gives URL keyboards on mobile; validation
          belongs to one place, and the server already does it.
        */}
        <InputGroupInput
          id="search-query"
          name="query"
          type="search"
          inputMode={isUrl ? 'url' : 'search'}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={
            isUrl ? 'https://youtube.com/watch?v=…' : 'Enter song title or artist…'
          }
          autoComplete="off"
          spellCheck={false}
          aria-describedby="search-hint"
          className="py-3 text-sm tracking-wide placeholder:text-muted-foreground"
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            variant="default"
            size="sm"
            disabled={loading}
            className="h-9 px-6 tracking-widest"
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                SEARCHING
              </>
            ) : (
              <>
                <Search data-icon="inline-start" aria-hidden="true" />
                SEARCH
              </>
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p
        id="search-hint"
        className="text-muted-foreground mt-2 text-[0.65rem] tracking-widest"
      >
        {isUrl
          ? 'Paste a YouTube video or playlist link'
          : 'Search across YouTube, torrent sites, and MP3 sources'}
      </p>
    </form>
  );
}
