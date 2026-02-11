/**
 * Cache Service
 * خدمة الـ Caching باستخدام Redis
 * 
 * Features:
 * - Get/Set cached data with TTL
 * - Cache invalidation
 * - Namespace support
 * - JSON serialization
 */

import redis from '../config/redis.js';

/**
 * Default TTL: 60 seconds (1 minute)
 * المستخدم طلب 1 دقيقة عشان الموظف الجديد يظهر بسرعة
 */
const DEFAULT_TTL = 60;

class CacheService {
  /**
   * Get cached value
   * @param {String} key - Cache key
   * @returns {Promise<any|null>}
   */
  static async get(key) {
    try {
      const value = await redis.get(key);
      
      if (!value) {
        return null;
      }
      
      // Try to parse JSON
      try {
        return JSON.parse(value);
      } catch {
        // Return as string if not JSON
        return value;
      }
    } catch (error) {
      console.error(`❌ Cache get error for key "${key}":`, error.message);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   * @param {String} key - Cache key
   * @param {any} value - Value to cache
   * @param {Number} ttl - Time to live in seconds (default: 60s)
   * @returns {Promise<Boolean>}
   */
  static async set(key, value, ttl = DEFAULT_TTL) {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Set with expiration
      const result = await redis.setex(key, ttl, serialized);
      
      return result === 'OK';
    } catch (error) {
      console.error(`❌ Cache set error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Delete cached value
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>}
   */
  static async del(key) {
    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`❌ Cache delete error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys
   * @param {String[]} keys - Array of cache keys
   * @returns {Promise<Number>} - Number of deleted keys
   */
  static async delMany(keys) {
    try {
      if (!keys || keys.length === 0) {
        return 0;
      }
      
      const result = await redis.del(...keys);
      return result;
    } catch (error) {
      console.error(`❌ Cache delete many error:`, error.message);
      return 0;
    }
  }

  /**
   * Delete keys by pattern
   * @param {String} pattern - Pattern to match (e.g., "employees:*")
   * @returns {Promise<Number>} - Number of deleted keys
   */
  static async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await redis.del(...keys);
      return result;
    } catch (error) {
      console.error(`❌ Cache delete pattern error for "${pattern}":`, error.message);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>}
   */
  static async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache exists error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param {String} key - Cache key
   * @returns {Promise<Number>} - Remaining seconds (-1 if no expiry, -2 if not exists)
   */
  static async ttl(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`❌ Cache TTL error for key "${key}":`, error.message);
      return -2;
    }
  }

  /**
   * Clear all cache (use with caution!)
   * @returns {Promise<Boolean>}
   */
  static async clear() {
    try {
      await redis.flushdb();
      console.log('✅ Cache cleared');
      return true;
    } catch (error) {
      console.error(`❌ Cache clear error:`, error.message);
      return false;
    }
  }

  /**
   * Get cache size (number of keys)
   * @returns {Promise<Number>}
   */
  static async size() {
    try {
      return await redis.dbsize();
    } catch (error) {
      console.error(`❌ Cache size error:`, error.message);
      return 0;
    }
  }

  /**
   * Generate cache key with namespace
   * @param {String} namespace - Namespace (e.g., "employees", "devices")
   * @param {String} identifier - Unique identifier
   * @returns {String}
   */
  static key(namespace, identifier) {
    return `${namespace}:${identifier}`;
  }

  /**
   * Helper: Cache wrapper for async functions
   * يجيب البيانات من الـ Cache، وإذا مو موجودة يجيبها من الـ Database
   * 
   * @param {String} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {Number} ttl - TTL in seconds
   * @returns {Promise<any>}
   */
  static async remember(key, fetchFn, ttl = DEFAULT_TTL) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      
      if (cached !== null) {
        console.log(`🎯 Cache HIT: ${key}`);
        return cached;
      }
      
      console.log(`💨 Cache MISS: ${key} - Fetching from source...`);
      
      // Fetch from source
      const data = await fetchFn();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`❌ Cache remember error for key "${key}":`, error.message);
      // If cache fails, still try to fetch from source
      return await fetchFn();
    }
  }

  /**
   * Invalidate cache for organization
   * عند تعديل/إضافة/حذف موظف، نحذف الـ cache للمنظمة
   * 
   * @param {Number} organizationId - Organization ID
   * @param {String} resource - Resource type (employees, devices, etc.)
   */
  static async invalidateOrganization(organizationId, resource = '*') {
    try {
      const pattern = `org:${organizationId}:${resource}:*`;
      const deleted = await this.delPattern(pattern);
      
      if (deleted > 0) {
        console.log(`🗑️ Cache invalidated: ${deleted} keys for org ${organizationId}`);
      }
      
      return deleted;
    } catch (error) {
      console.error(`❌ Cache invalidate error for org ${organizationId}:`, error.message);
      return 0;
    }
  }
}

export default CacheService;
