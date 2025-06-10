import NodeCache from 'node-cache';
import logger from '@/utils/logger';

export class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds: number) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
    logger.info(`CacheService initialized with a TTL of ${ttlSeconds} seconds.`);
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value) {
      logger.debug(`CACHE HIT for key: ${key}`);
      return value;
    }
    logger.debug(`CACHE MISS for key: ${key}`);
    return undefined;
  }

  set<T>(key: string, value: T, ttl: number | string = this.cache.options.stdTTL!): boolean {
    logger.debug(`CACHE SET for key: ${key}`);
    return this.cache.set(key, value, ttl);
  }

  del(keys: string | string[]): number {
    logger.debug(`CACHE DEL for keys: ${keys}`);
    return this.cache.del(keys);
  }

  flush(): void {
    logger.info('CACHE FLUSH initiated.');
    this.cache.flushAll();
  }

  keys(): string[] {
    return this.cache.keys();
  }
}

// Export a singleton instance
const cacheService = new CacheService(300); // 5-minute default TTL
export default cacheService; 