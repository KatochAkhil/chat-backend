class InMemoryCache {
  private cache = new Map<string, string>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    // Clear any existing timeout for this key
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(key);
    }

    this.cache.set(key, value);

    if (options?.EX) {
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      }, options.EX * 1000);
      this.timeouts.set(key, timeout);
    }

    return "OK";
  }

  async del(key: string): Promise<number> {
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(key);
    }

    const deleted = this.cache.has(key);
    this.cache.delete(key);
    return deleted ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const prefix = pattern.replace("*", "");
    return Array.from(this.cache.keys()).filter((key) => key.startsWith(prefix));
  }
}

let cacheClient: InMemoryCache | null = null;

export function getCacheClient() {
  if (!cacheClient) {
    cacheClient = new InMemoryCache();
  }
  return cacheClient;
}
