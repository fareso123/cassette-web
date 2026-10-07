import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { searchHistory } from './db/schema';

export interface HistoryEntry {
  id: number;
  query: string;
  queryType: string;
  resultsCount: number;
  createdAt: Date;
}

const MAX_QUERY_LENGTH = 500;

/**
 * Append a search to a user's history.
 *
 * Never throws: history is a convenience, and a write failure must not turn
 * a successful search into a 500. The error is logged and swallowed.
 */
export async function recordSearch(
  userId: number,
  query: string,
  queryType: 'song' | 'url',
  resultsCount: number
): Promise<void> {
  try {
    await db.insert(searchHistory).values({
      userId,
      query: query.slice(0, MAX_QUERY_LENGTH),
      queryType,
      resultsCount,
    });
  } catch (error) {
    console.error('Failed to record search history:', error);
  }
}

/**
 * A user's recent searches, newest first. Excludes duplicate consecutive
 * queries so repeatedly searching the same term does not fill the list.
 */
export async function getRecentSearches(
  userId: number,
  limit = 20
): Promise<HistoryEntry[]> {
  const rows = await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit * 2);

  const seen = new Set<string>();
  const unique: HistoryEntry[] = [];

  for (const row of rows) {
    const key = row.query.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({
      id: row.id,
      query: row.query,
      queryType: row.queryType,
      resultsCount: row.resultsCount,
      createdAt: row.createdAt,
    });
    if (unique.length >= limit) break;
  }

  return unique;
}

/** Remove a user's history. Returns the number of rows deleted. */
export async function clearSearchHistory(userId: number): Promise<number> {
  const deleted = await db
    .delete(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .returning({ id: searchHistory.id });
  return deleted.length;
}
