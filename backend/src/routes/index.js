/**
 * Main Routes Setup
 * Import and configure all API routes
 */

import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import accessLogRoutes from './accessLogRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import userRoutes from './userRoutes.js';
import biometricRoutes from './biometricRoutes.js';
import printRoutes from './printRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import attendanceLogRoutes from './attendanceLogRoutes.js';
import workScheduleRoutes from './workScheduleRoutes.js';
import attendanceReportRoutes from './attendanceReportRoutes.js';

/**
 * Setup all API routes
 * @param {Express} app - Express application instance
 */
export const setupRoutes = (app) => {
  const API_PREFIX = '/api';

  // Authentication routes
  app.use(`${API_PREFIX}/auth`, authRoutes);

  // Employee routes
  app.use(`${API_PREFIX}/employees`, employeeRoutes);

  // Organization routes
  app.use(`${API_PREFIX}/organizations`, organizationRoutes);

  // Device routes
  app.use(`${API_PREFIX}/devices`, deviceRoutes);

  // Access log routes
  app.use(`${API_PREFIX}/access-logs`, accessLogRoutes);

  // Audit log routes
  app.use(`${API_PREFIX}/audit-logs`, auditLogRoutes);

  // User routes
  app.use(`${API_PREFIX}/users`, userRoutes);

  // Biometric routes
  app.use(`${API_PREFIX}/biometrics`, biometricRoutes);

  // Print routes
  app.use(`${API_PREFIX}/print`, printRoutes);

  // Notification routes
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);

  // Attendance log routes
  app.use(`${API_PREFIX}/attendance-logs`, attendanceLogRoutes);

  // Work schedule routes
  app.use(`${API_PREFIX}/work-schedules`, workScheduleRoutes);

  // Attendance report routes
  app.use(`${API_PREFIX}/reports`, attendanceReportRoutes);

  // Root API route
  app.get(`${API_PREFIX}`, (req, res) => {
    res.json({
      success: true,
      message: 'HikVision ACS API',
      version: process.env.API_VERSION || '1.0.0',
      endpoints: {
        auth: `${API_PREFIX}/auth`,
        employees: `${API_PREFIX}/employees`,
        organizations: `${API_PREFIX}/organizations`,
        devices: `${API_PREFIX}/devices`,
        accessLogs: `${API_PREFIX}/access-logs`,
        attendanceLogs: `${API_PREFIX}/attendance-logs`,
        auditLogs: `${API_PREFIX}/audit-logs`,
        users: `${API_PREFIX}/users`,
        biometrics: `${API_PREFIX}/biometrics`,
        workSchedules: `${API_PREFIX}/work-schedules`,
        reports: `${API_PREFIX}/reports`,
        print: `${API_PREFIX}/print`,
        notifications: `${API_PREFIX}/notifications`
      }
    });
  });
};
