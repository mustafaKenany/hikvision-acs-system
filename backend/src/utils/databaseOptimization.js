/**
 * Database Optimization Utilities
 * أدوات لتحسين أداء قاعدة البيانات
 */

import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Batch Operations Helper
 * تنفيذ عمليات متعددة دفعة واحدة
 */
export class BatchOperations {
  /**
   * Bulk insert with transaction
   * @param {Model} Model - Sequelize model
   * @param {Array} data - Array of objects to insert
   * @param {Object} options - Sequelize options
   */
  static async bulkInsert(Model, data, options = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await Model.bulkCreate(data, {
        transaction,
        ...options
      });
      
      await transaction.commit();
      logger.info(`Bulk inserted ${result.length} records into ${Model.name}`);
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Bulk insert failed for ${Model.name}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update with transaction
   * @param {Model} Model 
   * @param {Object} values - Values to update
   * @param {Object} where - Where clause
   */
  static async bulkUpdate(Model, values, where) {
    const transaction = await sequelize.transaction();
    
    try {
      const [count] = await Model.update(values, {
        where,
        transaction
      });
      
      await transaction.commit();
      logger.info(`Bulk updated ${count} records in ${Model.name}`);
      return count;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Bulk update failed for ${Model.name}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete with transaction
   * @param {Model} Model 
   * @param {Object} where - Where clause
   */
  static async bulkDelete(Model, where) {
    const transaction = await sequelize.transaction();
    
    try {
      const count = await Model.destroy({
        where,
        transaction
      });
      
      await transaction.commit();
      logger.info(`Bulk deleted ${count} records from ${Model.name}`);
      return count;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Bulk delete failed for ${Model.name}:`, error);
      throw error;
    }
  }
}

/**
 * Query Optimization Helper
 * تحسين الاستعلامات
 */
export class QueryOptimizer {
  /**
   * Get optimized query with pagination, sorting, and filtering
   * @param {Model} Model 
   * @param {Object} options 
   */
  static buildOptimizedQuery(Model, {
    where = {},
    include = [],
    attributes = null,
    page = 1,
    limit = 50,
    order = [['created_at', 'DESC']],
    distinct = false
  } = {}) {
    const offset = (page - 1) * limit;

    return {
      where,
      include: include.map(inc => ({
        ...inc,
        attributes: inc.attributes || undefined, // Only fetch needed columns
        required: inc.required !== undefined ? inc.required : false
      })),
      attributes,
      limit,
      offset,
      order,
      distinct,
      subQuery: false // Prevent slow subqueries
    };
  }

  /**
   * Execute query with pagination info
   * @param {Model} Model 
   * @param {Object} queryOptions 
   */
  static async findWithPagination(Model, queryOptions) {
    try {
      const { count, rows } = await Model.findAndCountAll(queryOptions);

      const totalPages = Math.ceil(count / queryOptions.limit);
      const currentPage = Math.floor(queryOptions.offset / queryOptions.limit) + 1;

      return {
        data: rows,
        pagination: {
          total: count,
          total_pages: totalPages,
          current_page: currentPage,
          per_page: queryOptions.limit,
          has_next: currentPage < totalPages,
          has_prev: currentPage > 1
        }
      };
    } catch (error) {
      logger.error('Error in findWithPagination:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query safely
   * @param {string} sql 
   * @param {Object} replacements 
   */
  static async executeRawQuery(sql, replacements = {}) {
    try {
      const [results, metadata] = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      return results;
    } catch (error) {
      logger.error('Error executing raw query:', error);
      throw error;
    }
  }
}

/**
 * Connection Pool Monitor
 * مراقبة connection pool
 */
export class ConnectionPoolMonitor {
  /**
   * Get current pool stats
   */
  static getPoolStats() {
    const pool = sequelize.connectionManager.pool;
    
    if (!pool) {
      return { error: 'Pool not available' };
    }

    return {
      size: pool.size,
      available: pool.available,
      using: pool.using,
      waiting: pool.waiting,
      max: pool.max,
      min: pool.min
    };
  }

  /**
   * Check pool health
   */
  static async checkPoolHealth() {
    try {
      const stats = this.getPoolStats();
      
      // Check if pool is exhausted
      if (stats.available === 0 && stats.waiting > 0) {
        logger.warn('Database pool exhausted!', stats);
        return {
          healthy: false,
          reason: 'Pool exhausted',
          stats
        };
      }

      // Check if connections are accumulating
      if (stats.using > stats.max * 0.8) {
        logger.warn('Database pool usage high!', stats);
        return {
          healthy: false,
          reason: 'High usage',
          stats
        };
      }

      return {
        healthy: true,
        stats
      };
    } catch (error) {
      logger.error('Error checking pool health:', error);
      return {
        healthy: false,
        reason: error.message
      };
    }
  }

  /**
   * Log pool stats (for monitoring)
   */
  static logPoolStats() {
    const stats = this.getPoolStats();
    logger.info('Database Pool Stats:', stats);
    return stats;
  }
}

/**
 * Index Analyzer
 * تحليل وتحسين الـ indexes
 */
export class IndexAnalyzer {
  /**
   * Get missing indexes suggestions
   */
  static async analyzeMissingIndexes() {
    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          attname as column_name,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public'
        AND n_distinct > 100
        AND correlation < 0.8
        ORDER BY n_distinct DESC
        LIMIT 20;
      `;

      const results = await QueryOptimizer.executeRawQuery(query);
      
      logger.info('Potential columns for indexing:', results);
      return results;
    } catch (error) {
      logger.error('Error analyzing indexes:', error);
      return [];
    }
  }

  /**
   * Get slow queries
   */
  static async getSlowQueries(minDuration = 1000) {
    try {
      const query = `
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time
        FROM pg_stat_statements
        WHERE mean_time > $minDuration
        ORDER BY mean_time DESC
        LIMIT 20;
      `;

      const results = await QueryOptimizer.executeRawQuery(query, { minDuration });
      
      logger.info(`Slow queries (> ${minDuration}ms):`, results);
      return results;
    } catch (error) {
      logger.error('Error getting slow queries:', error);
      return [];
    }
  }
}

/**
 * Transaction Helper
 * مساعدات للمعاملات
 */
export class TransactionHelper {
  /**
   * Execute function within transaction
   * @param {Function} callback - Async function to execute
   */
  static async executeInTransaction(callback) {
    const transaction = await sequelize.transaction();
    
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Execute multiple operations atomically
   * @param {Array<Function>} operations - Array of async functions
   */
  static async executeAtomic(operations) {
    return this.executeInTransaction(async (transaction) => {
      const results = [];
      
      for (const operation of operations) {
        const result = await operation(transaction);
        results.push(result);
      }
      
      return results;
    });
  }
}

/**
 * Query Cache Manager
 * إدارة cache للاستعلامات (باستخدام Redis)
 */
export class QueryCacheManager {
  /**
   * Execute query with auto-caching
   * @param {string} cacheKey 
   * @param {Function} queryFn 
   * @param {number} ttl 
   */
  static async executeWithCache(cacheKey, queryFn, ttl = 300) {
    try {
      // Try to get from cache
      const redis = require('../config/redis.js').default;
      
      if (redis && redis.status === 'ready') {
        const cached = await redis.get(cacheKey);
        
        if (cached) {
          logger.debug(`Cache HIT: ${cacheKey}`);
          return JSON.parse(cached);
        }
      }

      // Execute query
      logger.debug(`Cache MISS: ${cacheKey}`);
      const result = await queryFn();

      // Cache result
      if (redis && redis.status === 'ready') {
        await redis.setex(cacheKey, ttl, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      logger.error('Error in executeWithCache:', error);
      // Return query result even if caching fails
      return await queryFn();
    }
  }
}

/**
 * Performance Monitor
 * مراقبة الأداء
 */
export class PerformanceMonitor {
  /**
   * Measure query execution time
   * @param {string} queryName 
   * @param {Function} queryFn 
   */
  static async measureQueryTime(queryName, queryFn) {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      logger.info(`Query "${queryName}" executed in ${duration}ms`);
      
      // Log warning for slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${queryName} (${duration}ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Query "${queryName}" failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Get database size
   */
  static async getDatabaseSize() {
    try {
      const query = `
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as size_bytes
      `;

      const [result] = await QueryOptimizer.executeRawQuery(query);
      return result;
    } catch (error) {
      logger.error('Error getting database size:', error);
      return null;
    }
  }

  /**
   * Get table sizes
   */
  static async getTableSizes() {
    try {
      const query = `
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
        LIMIT 20;
      `;

      const results = await QueryOptimizer.executeRawQuery(query);
      return results;
    } catch (error) {
      logger.error('Error getting table sizes:', error);
      return [];
    }
  }
}

export default {
  BatchOperations,
  QueryOptimizer,
  ConnectionPoolMonitor,
  IndexAnalyzer,
  TransactionHelper,
  QueryCacheManager,
  PerformanceMonitor
};
