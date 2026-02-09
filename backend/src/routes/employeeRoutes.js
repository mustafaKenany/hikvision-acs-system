import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  employeeIdValidator,
  listEmployeesValidator
} from '../validators/employeeValidator.js';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  activateEmployee,
  deactivateEmployee,
  getEmployeeBiometrics,
  getDepartments,
  getEmployeeStats,
  uploadEmployeePhoto,
  getEmployeePhoto,
  deleteEmployeePhoto
} from '../controllers/employeeController.js';
import {
  getEmployeeActivityLogs
} from '../controllers/activityLogController.js';
import { setUploadPath, uploadEmployeePhoto as uploadPhoto } from '../middlewares/upload.js';
import { processEmployeePhotoMiddleware } from '../middlewares/imageProcessor.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

/**
 * @route   GET /api/employees/stats/overview
 * @desc    Get employee statistics
 * @access  Private (admin+, manager+)
 */
router.get(
  '/stats/overview',
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployeeStats
);

/**
 * @route   GET /api/employees/departments/list
 * @desc    Get departments list
 * @access  Private (admin+, manager+)
 */
router.get(
  '/departments/list',
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getDepartments
);

/**
 * @route   GET /api/employees/:id/biometrics
 * @desc    Get employee biometric data
 * @access  Private (admin+, manager+, employees.read)
 */
router.get(
  '/:id/biometrics',
  employeeIdValidator,
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployeeBiometrics
);

/**
 * @route   GET /api/employees/:id/activity-logs
 * @desc    Get employee activity logs (attendance logs)
 * @access  Private (admin+, manager+, employees.read)
 */
router.get(
  '/:id/activity-logs',
  employeeIdValidator,
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployeeActivityLogs
);

/**
 * @route   POST /api/employees/:id/activate
 * @desc    Activate employee
 * @access  Private (admin+, employees.update)
 */
router.post(
  '/:id/activate',
  employeeIdValidator,
  authorize(['super_admin', 'admin'], ['employees.update']),
  activateEmployee
);

/**
 * @route   POST /api/employees/:id/deactivate
 * @desc    Deactivate employee
 * @access  Private (admin+, employees.update)
 */
router.post(
  '/:id/deactivate',
  employeeIdValidator,
  authorize(['super_admin', 'admin'], ['employees.update']),
  deactivateEmployee
);

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Private (admin+, manager+, employees.read)
 */
router.get(
  '/',
  listEmployeesValidator,
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployees
);

/**
 * @route   GET /api/employees/:id
 * @desc    Get single employee
 * @access  Private (admin+, manager+, employees.read)
 */
router.get(
  '/:id',
  employeeIdValidator,
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployee
);

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private (admin+, employees.create)
 */
router.post(
  '/',
  createEmployeeValidator,
  authorize(['super_admin', 'admin'], ['employees.create']),
  createEmployee
);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private (admin+, employees.update)
 */
router.put(
  '/:id',
  updateEmployeeValidator,
  authorize(['super_admin', 'admin'], ['employees.update']),
  updateEmployee
);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee
 * @access  Private (admin+, employees.delete)
 */
router.delete(
  '/:id',
  employeeIdValidator,
  authorize(['super_admin', 'admin'], ['employees.delete']),
  deleteEmployee
);

/**
 * @route   POST /api/employees/:id/photo
 * @desc    Upload employee photo
 * @access  Private (admin+, employees.update)
 */
router.post(
  '/:id/photo',
  employeeIdValidator,
  authorize(['super_admin', 'admin'], ['employees.update']),
  setUploadPath('employees/photos'),
  uploadPhoto,
  processEmployeePhotoMiddleware,
  uploadEmployeePhoto
);

/**
 * @route   GET /api/employees/:id/photo
 * @desc    Get employee photo
 * @access  Private (admin+, manager+, employees.read)
 */
router.get(
  '/:id/photo',
  employeeIdValidator,
  authorize(['super_admin', 'admin', 'manager'], ['employees.read']),
  getEmployeePhoto
);

/**
 * @route   DELETE /api/employees/:id/photo
 * @desc    Delete employee photo
 * @access  Private (admin+, employees.delete)
 */
router.delete(
  '/:id/photo',
  employeeIdValidator,
  authorize(['super_admin', 'admin'], ['employees.delete']),
  deleteEmployeePhoto
);

export default router;
