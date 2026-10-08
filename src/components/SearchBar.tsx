'use client';

import { Search, Music, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

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
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {/*
        ToggleGroup replaces the old role="group" + aria-pressed pair. Base UI
        moves this between items with a single tab stop and arrow keys, where
        the previous markup made each button its own tab stop.
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
        className="w-full"
      >
        <ToggleGroupItem
          value="song"
          className="flex-1 gap-2 rounded-md py-2.5"
        >
          <Music data-icon="inline-start" aria-hidden="true" />
          Song name
        </ToggleGroupItem>
        <ToggleGroupItem
          value="url"
          className="flex-1 gap-2 rounded-md py-2.5"
        >
          <Link2 data-icon="inline-start" aria-hidden="true" />
          YouTube URL
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Search input + submit */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
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
              isUrl ? 'https://youtube.com/watch?v=…' : 'Song title or artist…'
            }
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-hint"
            className={cn(
              'py-2.5',
              // The clear affordance the native search type adds is a square
              // box that fights the rounded field.
              '[&::-webkit-search-cancel-button]:appearance-none'
            )}
          />
        </InputGroup>

        {/*
          InputGroupButton restricts `size` to its own xs/sm/icon scale, so the
          submit button takes no size prop and is sized in className. It is a
          standalone Button rather than an addon because on mobile it sits on
          its own row below the field.
        */}
        <Button
          type="submit"
          variant="default"
          disabled={loading}
          className="h-11 shrink-0 gap-2 rounded-md px-5 sm:w-auto"
        >
          {loading ? (
            <>
              <Spinner data-icon="inline-start" />
              Searching
            </>
          ) : (
            <>
              <Search data-icon="inline-start" aria-hidden="true" />
              Search
            </>
          )}
        </Button>
      </div>

      <p id="search-hint" className="text-muted-foreground text-xs">
        {isUrl
          ? 'Paste a YouTube video or playlist link'
          : 'Searches YouTube, torrent sites and MP3 sources'}
      </p>
    </form>
  );
}
