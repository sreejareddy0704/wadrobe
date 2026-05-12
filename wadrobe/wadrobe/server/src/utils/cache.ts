export class SimpleCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  set(key: string, value: any, ttlSeconds: number = 3600) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache();
