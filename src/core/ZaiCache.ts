/**
 * Cache entry with data and timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Generic cache implementation with TTL (Time To Live)
 */
export class ZaiCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl: number; // TTL in milliseconds

  /**
   * Create a new cache
   * @param ttlSeconds Time to live in seconds (default: 300 seconds = 5 minutes)
   */
  constructor(ttlSeconds: number = 300) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      // Entry expired
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate a specific cache entry
   * @param key Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get the number of entries in the cache
   * @returns Number of entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
