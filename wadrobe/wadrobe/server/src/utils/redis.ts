import Redis from 'ioredis';
import { config } from '../config/config.js';

const redis = new (Redis as any)(config.redisUrl);

redis.on('error', (error: any) => {
  console.error('[Redis Error]:', error);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

/**
 * Get data from cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

/**
 * Set data in cache
 */
export const setCache = async (key: string, value: any, ttlSeconds: number = 3600): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
};

/**
 * Clear data from cache
 */
export const clearCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
  }
};

/**
 * Clear cache by pattern
 */
export const clearCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Error clearing cache pattern ${pattern}:`, error);
  }
};

export default redis;
