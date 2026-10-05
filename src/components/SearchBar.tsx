'use client';

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'song' | 'url'>('song');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), type }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('song')}
            className={`px-4 py-2 rounded-l-md border ${type === 'song' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Song Name
          </button>
          <button
            type="button"
            onClick={() => setType('url')}
            className={`px-4 py-2 rounded-r-md border ${type === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            URL
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              type === 'url' ? 'Paste YouTube URL...' : 'Search for songs...'
            }
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-semibold">Results ({results.length})</h3>
          {results.map((result, index) => (
            <div key={index} className="p-4 border rounded-md">
              <div className="font-medium">{result.title}</div>
              <div className="text-sm text-gray-600">{result.artist}</div>
              {result.downloadUrl && (
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline"
                >
                  Open Link
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
