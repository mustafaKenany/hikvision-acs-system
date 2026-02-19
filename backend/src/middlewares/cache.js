/**
 * Redis Cache Middleware
 * Middleware للتخزين المؤقت باستخدام Redis
 */

import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Default TTL values (in seconds)
 */
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_DEFAULT) || 60; // 1 minute
const EMPLOYEES_TTL = parseInt(process.env.CACHE_TTL_EMPLOYEES) || 300; // 5 minutes
const ORGANIZATIONS_TTL = parseInt(process.env.CACHE_TTL_ORGANIZATIONS) || 300; // 5 minutes
const DEVICES_TTL = parseInt(process.env.CACHE_TTL_DEVICES) || 180; // 3 minutes

/**
 * Generate cache key from request
 * @param {Object} req - Express request object
 * @returns {string} Cache key
 */
const generateCacheKey = (req) => {
  const { path, query, user } = req;
  const queryString = JSON.stringify(query);
  const userId = user?.id || 'anonymous';
  const orgId = user?.organization_id || 'no-org';
  
  return `cache:${orgId}:${userId}:${path}:${queryString}`;
};

/**
 * Cache Middleware
 * يخزن نتائج الـ API في Redis ويسترجعها عند الطلب
 * 
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (ttl = DEFAULT_TTL) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not available
    if (!redis || redis.status !== 'ready') {
      return next();
    }

    try {
      const cacheKey = generateCacheKey(req);
      
      // Try to get cached data
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache HIT: ${cacheKey}`);
        
        // Parse and return cached data
        const parsedData = JSON.parse(cachedData);
        return res.status(200).json({
          ...parsedData,
          cached: true,
          cached_at: new Date().toISOString()
        });
      }
      
      logger.debug(`Cache MISS: ${cacheKey}`);
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(data))
          .catch(err => logger.error('Cache set error:', err));
        
        // Call original json method
        return originalJson(data);
      };
      
      next();
      
    } catch (error) {
      logger.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:org-1:*')
 */
export const clearCacheByPattern = async (pattern) => {
  try {
    if (!redis || redis.status !== 'ready') {
      logger.warn('Redis not available for cache clearing');
      return;
    }

    // Get all keys matching pattern
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cleared ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};

/**
 * Clear all cache for an organization
 * @param {number} organizationId 
 */
export const clearOrganizationCache = async (organizationId) => {
  await clearCacheByPattern(`cache:${organizationId}:*`);
};

/**
 * Clear all cache for a user
 * @param {number} userId
 * @param {number} organizationId
 */
export const clearUserCache = async (userId, organizationId) => {
  await clearCacheByPattern(`cache:${organizationId}:${userId}:*`);
};

/**
 * Clear cache after data modification
 * يُستخدم في POST, PUT, DELETE requests
 */
export const clearCacheAfterMutation = async (req, res, next) => {
  // Store original response methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  // Override to clear cache after successful response
  res.json = async function(data) {
    // If successful response (2xx), clear related cache
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const orgId = req.user?.organization_id || 'no-org';
      
      // Clear cache based on route
      if (req.baseUrl.includes('/employees')) {
        await clearCacheByPattern(`cache:${orgId}:*:/api/employees*`);
      } else if (req.baseUrl.includes('/devices')) {
        await clearCacheByPattern(`cache:${orgId}:*:/api/devices*`);
      } else if (req.baseUrl.includes('/organizations')) {
        await clearCacheByPattern(`cache:${orgId}:*:/api/organizations*`);
      } else if (req.baseUrl.includes('/work-schedules')) {
        await clearCacheByPattern(`cache:${orgId}:*:/api/work-schedules*`);
      } else if (req.baseUrl.includes('/reports')) {
        await clearCacheByPattern(`cache:${orgId}:*:/api/reports*`);
      }
    }
    
    return originalJson(data);
  };
  
  res.send = async function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const orgId = req.user?.organization_id || 'no-org';
      await clearCacheByPattern(`cache:${orgId}:*`);
    }
    return originalSend(data);
  };
  
  next();
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    if (!redis || redis.status !== 'ready') {
      return { status: 'disconnected' };
    }

    const info = await redis.info('stats');
    const dbSize = await redis.dbsize();
    const memory = await redis.info('memory');
    
    return {
      status: 'connected',
      keys: dbSize,
      stats: info,
      memory: memory
    };
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return { status: 'error', error: error.message };
  }
};

/**
 * Flush all cache (admin only)
 */
export const flushAllCache = async () => {
  try {
    if (redis && redis.status === 'ready') {
      await redis.flushdb();
      logger.info('All cache cleared');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error flushing cache:', error);
    return false;
  }
};

// Export TTL constants
export const CACHE_TTL = {
  DEFAULT: DEFAULT_TTL,
  EMPLOYEES: EMPLOYEES_TTL,
  ORGANIZATIONS: ORGANIZATIONS_TTL,
  DEVICES: DEVICES_TTL,
  SHORT: 30,      // 30 seconds
  MEDIUM: 300,    // 5 minutes
  LONG: 900,      // 15 minutes
  VERY_LONG: 3600 // 1 hour
};

export default {
  cacheMiddleware,
  clearCacheByPattern,
  clearOrganizationCache,
  clearUserCache,
  clearCacheAfterMutation,
  getCacheStats,
  flushAllCache,
  CACHE_TTL
};
