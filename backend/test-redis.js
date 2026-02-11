/**
 * Test Redis Connection
 * اختبار اتصال Redis بسيط
 */

import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  lazyConnect: false
});

redis.on('connect', () => {
  console.log('✅ Redis: Connected successfully');
});

redis.on('ready', async () => {
  console.log('✅ Redis: Ready to accept commands');
  
  try {
    // Test PING
    const pong = await redis.ping();
    console.log(`✅ PING test: ${pong}`);
    
    // Test SET
    await redis.set('test:connection', 'Hello from Memurai!');
    console.log('✅ SET test: Success');
    
    // Test GET
    const value = await redis.get('test:connection');
    console.log(`✅ GET test: ${value}`);
    
    // Test DEL
    await redis.del('test:connection');
    console.log('✅ DEL test: Success');
    
    // Get server info
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/);
    if (version) {
      console.log(`✅ Redis Version: ${version[1]}`);
    }
    
    console.log('\n🎉 All tests passed! Redis is working perfectly!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 10000);
