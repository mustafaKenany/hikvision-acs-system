/**
 * Server Entry Point
 * نقطة الدخول لتشغيل السيرفر
 */

import app from './src/app.js';
import { sequelize } from './src/models/index.js';
import logger from './src/utils/logger.js';

// Port configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Server instance
let server;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // 1. Test database connection
    logger.info('Testing database connection...');
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // 2. Sync database (في development فقط)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Syncing database models...');
      // alter: true سيحدث الجداول دون حذف البيانات
      // await sequelize.sync({ alter: true });
      // في production: استخدم migrations فقط
      logger.info('✅ Database models synced (skipped for now)');
    }

    // 3. Start HTTP server
    server = app.listen(PORT, HOST, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Server is running`);
      logger.info(`📍 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: ${process.env.DB_NAME || 'hikvision_acs_dev'}`);
      logger.info('='.repeat(50));
    });

    // 4. WebSocket setup (إذا كنا نستخدم Socket.io)
    // import { Server as SocketServer } from 'socket.io';
    // const io = new SocketServer(server, { cors: corsOptions });
    // setupSocketHandlers(io);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} signal received: closing HTTP server`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      // إغلاق اتصال database
      try {
        await sequelize.close();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing database connection:', error);
        process.exit(1);
      }
    });

    // إذا لم يتم إغلاق السيرفر خلال 10 ثوانٍ، أوقفه بالقوة
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default server;
