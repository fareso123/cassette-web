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
  onSubmit,
  onTypeChange,
}: SearchBarProps) {
  const isUrl = type === 'url';

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'mx-auto w-full max-w-2xl',
        // One control: the toggle sits above the field, and the submit
        // button is attached to the field's right edge so it reads as a
        // single synced unit rather than three separate widgets.
        'flex flex-col gap-2'
      )}
    >
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

      <div className="flex flex-row items-stretch gap-2">
        <InputGroup className="flex-1 h-11">
          <InputGroupAddon>
            <Search aria-hidden="true" className="text-muted-foreground" />
          </InputGroupAddon>

          {/*
            type is always "search". The old markup set type="url" in URL
            mode, which made the browser block submission through native
            constraint validation and show its own bubble instead of the
            app's role="alert" region. inputMode still gives URL keyboards
            on mobile; validation belongs to one place, and the server
            already does it.
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
              'h-full py-0',
              // The clear affordance the native search type adds is a
              // square box that fights the rounded field.
              '[&::-webkit-search-cancel-button]:appearance-none'
            )}
          />

          <InputGroupButton
            type="submit"
            variant="default"
            disabled={loading}
            className="h-full shrink-0 gap-2 rounded-md px-5"
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
          </InputGroupButton>
        </InputGroup>
      </div>

      <p id="search-hint" className="text-muted-foreground text-xs">
        {isUrl
          ? 'Paste a YouTube video or playlist link'
          : 'Searches YouTube for audio'}
      </p>
    </form>
  );
}