import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
// import { setupWebSocket } from './websocket/index.js'; // TODO: WebSocket not implemented yet
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import logger from './utils/logger.js';

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

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(generalLimiter);

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
    // TODO: Add database connection when ready
    logger.info('✅ Server starting...');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`
      ╔═══════════════════════════════════════════╗
      ║   🚀 HikVision ACS Backend Server        ║
      ║                                           ║
      ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(29)}║
      ║   Port: ${PORT.toString().padEnd(35)}║
      ║   API Version: ${(process.env.API_VERSION || '1.0.0').padEnd(28)}║
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
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, httpServer };
