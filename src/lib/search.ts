/** Remove characters that would break a PostgREST `or()` filter expression. */
export function sanitizeTerm(value: string): string {
  return value
    .replace(/[,()"'%\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------- recent search (client) */

const RECENT_SEARCH_KEY = "mana:recent-searches";
const RECENT_SEARCH_LIMIT = 6;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(term: string): string[] {
  const clean = term.trim();
  if (!clean || typeof window === "undefined") return readRecentSearches();
  const next = [clean, ...readRecentSearches().filter((entry) => entry.toLowerCase() !== clean.toLowerCase())].slice(
    0,
    RECENT_SEARCH_LIMIT,
  );
  try {
    window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked - recent searches are a nicety, not a feature */
  }
  return next;
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_SEARCH_KEY);
  } catch {
    /* ignore */
  }
}

