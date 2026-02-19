import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import {
  createWorkSchedule,
  getAllWorkSchedules,
  getWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  assignEmployeesToSchedule,
  getScheduleEmployees,
  removeEmployeeFromSchedule,
} from '../controllers/workScheduleController.js';
import {
  createWorkScheduleRules,
  updateWorkScheduleRules,
  getWorkScheduleByIdRules,
  deleteWorkScheduleRules,
  assignEmployeesRules,
  listWorkSchedulesRules,
} from '../validators/workScheduleValidator.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(generalLimiter);

/**
 * @route   GET /api/work-schedules
 * @desc    Get all work schedules
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['schedule.read']),
  listWorkSchedulesRules,
  getAllWorkSchedules
);

/**
 * @route   GET /api/work-schedules/:id
 * @desc    Get work schedule by ID
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/:id',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['schedule.read']),
  getWorkScheduleByIdRules,
  getWorkScheduleById
);

/**
 * @route   POST /api/work-schedules
 * @desc    Create new work schedule
 * @access  Private (admin+, manager+)
 */
router.post(
  '/',
  authorize(['super_admin', 'admin', 'manager'], ['schedule.create']),
  createWorkScheduleRules,
  createWorkSchedule
);

/**
 * @route   PUT /api/work-schedules/:id
 * @desc    Update work schedule
 * @access  Private (admin+, manager+)
 */
router.put(
  '/:id',
  authorize(['super_admin', 'admin', 'manager'], ['schedule.update']),
  updateWorkScheduleRules,
  updateWorkSchedule
);

/**
 * @route   DELETE /api/work-schedules/:id
 * @desc    Delete work schedule
 * @access  Private (admin+)
 */
router.delete(
  '/:id',
  authorize(['super_admin', 'admin'], ['schedule.delete']),
  deleteWorkScheduleRules,
  deleteWorkSchedule
);

/**
 * @route   POST /api/work-schedules/:id/assign-employees
 * @desc    Assign employees to work schedule
 * @access  Private (admin+, manager+)
 */
router.post(
  '/:id/assign-employees',
  authorize(['super_admin', 'admin', 'manager'], ['schedule.update', 'employee.update']),
  assignEmployeesRules,
  assignEmployeesToSchedule
);

/**
 * @route   GET /api/work-schedules/:id/employees
 * @desc    Get employees assigned to schedule
 * @access  Private (admin+, manager+, viewer+)
 */
router.get(
  '/:id/employees',
  authorize(['super_admin', 'admin', 'manager', 'viewer'], ['schedule.read', 'employee.read']),
  getWorkScheduleByIdRules,
  getScheduleEmployees
);

/**
 * @route   DELETE /api/work-schedules/:id/employees/:employeeId
 * @desc    Remove employee from schedule
 * @access  Private (admin+, manager+)
 */
router.delete(
  '/:id/employees/:employeeId',
  authenticate,
  authorize(['super_admin', 'admin', 'manager'], ['schedule.update', 'employee.update']),
  removeEmployeeFromSchedule
);

export default router;
