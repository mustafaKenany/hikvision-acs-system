/**
 * Express Application Setup
 * إعداد تطبيق Express مع جميع Middlewares والإعدادات
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middlewares
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  generalLimiter
} from './middlewares/index.js';

// Logger
import logger from './utils/logger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import attendanceLogRoutes from './routes/attendanceLogRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import printRoutes from './routes/printRoutes.js';
import accessLogRoutes from './routes/accessLogRoutes.js';
import biometricRoutes from './routes/biometricRoutes.js';
// ... etc

// Create Express app
const app = express();

// ======================
// Security Middlewares
// ======================

// Helmet - تأمين HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3000", "http://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false, // للسماح بـ CORS
  crossOriginResourcePolicy: { policy: "cross-origin" } // للسماح بتحميل الصور من نطاقات مختلفة
}));

// CORS - السماح للـ frontend بالاتصال
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true, // للسماح بـ cookies
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - الحماية من الطلبات الكثيرة
app.use('/api/', generalLimiter);

// ======================
// Body Parsing Middlewares
// ======================

app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body parser
app.use(cookieParser()); // Cookie parser

// ======================
// Logging Middlewares
// ======================

// Morgan - HTTP request logger (development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Custom request logger
app.use(requestLogger);

// ======================
// Health Check Endpoint
// ======================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes root
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HikVision ACS API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      employees: '/api/employees',
      devices: '/api/devices',
      organizations: '/api/organizations',
      doors: '/api/doors',
      attendance: '/api/attendance',
      reports: '/api/reports'
    }
  });
});

// ======================
// API Routes
// ======================

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// Device routes
app.use('/api/devices', deviceRoutes);

// Organization routes
app.use('/api/organizations', organizationRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Attendance Log routes
app.use('/api/attendance-logs', attendanceLogRoutes);

// Access Log routes
app.use('/api/access-logs', accessLogRoutes);

// Audit Log routes
app.use('/api/audit-logs', auditLogRoutes);

// Print routes
app.use('/api/print', printRoutes);

// Biometric routes (Face & Card Registration)
app.use('/api/biometrics', biometricRoutes);

// Door routes
// app.use('/api/doors', doorRoutes);

// Access Permission routes
// app.use('/api/access-permissions', accessPermissionRoutes);

// Work Schedule routes
// app.use('/api/work-schedules', workScheduleRoutes);

// Access Timezone routes
// app.use('/api/access-timezones', accessTimezoneRoutes);

// Attendance routes
// app.use('/api/attendance', attendanceRoutes);

// Report routes
// app.use('/api/reports', reportRoutes);

// Notification routes
// app.use('/api/notifications', notificationRoutes);

// Audit Log routes
// app.use('/api/audit-logs', auditLogRoutes);

// System Settings routes
// app.use('/api/settings', settingsRoutes);

// ======================
// Static Files (للصور والملفات)
// ======================

// Serve uploaded files with CORS headers
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

logger.info(`Static files will be served from: ${uploadsPath}`);

// ======================
// Error Handling
// ======================

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ======================
// Graceful Shutdown Handler
// ======================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // لا نوقف السيرفر هنا، فقط نسجل الخطأ
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // في production: يجب إيقاف السيرفر بعد uncaught exception
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

export default app;
