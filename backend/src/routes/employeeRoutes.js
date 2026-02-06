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
  getEmployeeStats
} from '../controllers/employeeController.js';

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

export default router;
