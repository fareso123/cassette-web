"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTabs } from "@/components/ResultsTabs";

export default function Home() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"song" | "url">("song");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [tab, setTab] = useState("song");

  const recentSearchesFromStorage = () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("recentSearches");
    return stored ? JSON.parse(stored) : [];
  };

  const saveToRecent = (query: string, type: string) => {
    if (typeof window === "undefined") return;
    const searches = recentSearchesFromStorage();
    const exists = searches.some((s: any) => s.query === query);
    const updated = exists
      ? searches.filter((s: any) => s.query !== query)
      : [
          {
            query,
            type,
            timestamp: new Date().toISOString(),
          },
        ].concat(searches.slice(0, 4));
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), type }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);
      saveToRecent(query, type);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const ytDlpResults = results.filter(
    (r: any) => r && r.directAudioUrl
  ) as any[];
  const scraperResults = results.filter(
    (r: any) => r && !r.directAudioUrl
  ) as any[];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          Cassette Web
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Search songs and find download links - YouTube, torrents, and more
        </p>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Search</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("song")}
                  className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                    type === "song"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Song Name
                </button>
                <button
                  type="button"
                  onClick={() => setType("url")}
                  className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                    type === "url"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  YouTube URL
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    type === "url"
                      ? "Paste YouTube URL..."
                      : "Search for songs..."
                  }
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          {recentSearches.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
              <ul className="space-y-2">
                {recentSearches.map((search: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setQuery(search.query);
                      setType(search.type as "song" | "url");
                    }}
                  >
                    <span>{search.query}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(search.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <ResultsTabs results={results} ytDlpResults={ytDlpResults} scraperResults={scraperResults} tab={tab} setTab={setTab} />
          )}
        </div>
      </div>
    </main>
  );
}