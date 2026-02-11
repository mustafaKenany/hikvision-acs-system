/**
 * Redis Client Configuration
 * إعداد اتصال Redis للـ Caching
 */

import Redis from 'ioredis';

/**
 * Redis Client Instance
 * TTL Default: 60 seconds (1 minute) - كما طلب المستخدم
 * 
 * Supports:
 * - Local Redis
 * - Upstash (Cloud Redis with TLS)
 * - AWS ElastiCache
 * - Azure Cache for Redis
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  
  // Connection options
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Reconnect on error
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  
  // Connection timeout
  connectTimeout: 10000,
  
  // Keep alive
  keepAlive: 30000,
  
  // Enable offline queue
  enableOfflineQueue: true,
  
  // Lazy connect (don't connect until first command)
  lazyConnect: false
};

// Add TLS support for cloud Redis (Upstash, AWS, Azure)
if (process.env.REDIS_TLS === 'true') {
  redisConfig.tls = {
    rejectUnauthorized: false // For Upstash compatibility
  };
  console.log('🔒 Redis TLS enabled (Cloud mode)');
}

const redis = new Redis(redisConfig);

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis: Connected successfully');
  console.log(`📍 Redis Host: ${redisConfig.host}:${redisConfig.port}`);
});

redis.on('ready', () => {
  console.log('✅ Redis: Ready to accept commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
  // Don't crash the app if Redis fails
  // System will continue to work without caching
});

redis.on('close', () => {
  console.log('⚠️ Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});

export default redis;
