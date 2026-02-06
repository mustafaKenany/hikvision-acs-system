import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
// import { setupWebSocket } from './websocket/index.js'; // TODO: WebSocket not implemented yet
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { sequelize } from './database/connection.js';
import logger from './utils/logger.js';
import { startCronJobs } from './cron/index.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Setup
// ============================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============================================
// API Routes
// ============================================
setupRoutes(app);

// ============================================
// Error Handling
// ============================================
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ============================================
// WebSocket Setup (TODO: Not implemented yet)
// ============================================
// setupWebSocket(httpServer);

// ============================================
// Database Connection & Server Start
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');

    // Sync models (development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synchronized');
    }

    // Start cron jobs
    startCronJobs();
    logger.info('✅ Cron jobs started');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`
      ╔═══════════════════════════════════════════╗
      ║   🚀 HikVision ACS Backend Server        ║
      ║                                           ║
      ║   Environment: ${process.env.NODE_ENV?.padEnd(29)}║
      ║   Port: ${PORT.toString().padEnd(35)}║
      ║   API Version: ${process.env.API_VERSION?.padEnd(28)}║
      ║                                           ║
      ║   Server is ready! 🎉                    ║
      ╚═══════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await sequelize.close();
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    await sequelize.close();
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, httpServer };
