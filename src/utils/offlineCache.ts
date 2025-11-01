const CACHE_PREFIX = "herhaven_offline_cache::";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const getStorageKey = (key: string) => `${CACHE_PREFIX}${key}`;

export const saveToCache = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    window.localStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to persist cache entry", error);
  }
};

export const loadFromCache = <T>(key: string, maxAge?: number): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (maxAge && Date.now() - entry.timestamp > maxAge) {
      window.localStorage.removeItem(getStorageKey(key));
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Failed to read cache entry", error);
    return null;
  }
};

export const clearCacheEntry = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.warn("Failed to clear cache entry", error);
  }
};

export const getCacheTimestamp = (key: string): number | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return entry.timestamp;
  } catch (error) {
    console.warn("Failed to read cache timestamp", error);
    return null;
  }
};
