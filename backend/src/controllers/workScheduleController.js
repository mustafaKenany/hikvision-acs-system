import asyncHandler from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorHandler.js';
import * as workScheduleService from '../services/workScheduleService.js';

/**
 * @desc    Create new work schedule
 * @route   POST /api/work-schedules
 * @access  Private (admin+, manager+)
 */
export const createWorkSchedule = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const schedule = await workScheduleService.createWorkSchedule(userId, req.body);

  success(res, schedule, 'تم إنشاء جدول الدوام بنجاح', 201);
});

/**
 * @desc    Get all work schedules
 * @route   GET /api/work-schedules
 * @access  Private (admin+, manager+)
 */
export const getAllWorkSchedules = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    organization_id: req.query.organization_id,
    is_active: req.query.is_active,
    is_flexible: req.query.is_flexible,
    search: req.query.search,
  };

  const result = await workScheduleService.getAllWorkSchedules(userId, filters);

  success(res, result, 'تم جلب جداول الدوام بنجاح', 200);
});

/**
 * @desc    Get work schedule by ID
 * @route   GET /api/work-schedules/:id
 * @access  Private (admin+, manager+)
 */
export const getWorkScheduleById = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const scheduleId = req.params.id;

  const schedule = await workScheduleService.getWorkScheduleById(userId, scheduleId);

  success(res, schedule, 'تم جلب جدول الدوام بنجاح', 200);
});

/**
 * @desc    Update work schedule
 * @route   PUT /api/work-schedules/:id
 * @access  Private (admin+, manager+)
 */
export const updateWorkSchedule = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const scheduleId = req.params.id;

  const schedule = await workScheduleService.updateWorkSchedule(userId, scheduleId, req.body);

  success(res, schedule, 'تم تحديث جدول الدوام بنجاح', 200);
});

/**
 * @desc    Delete work schedule
 * @route   DELETE /api/work-schedules/:id
 * @access  Private (admin+)
 */
export const deleteWorkSchedule = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const scheduleId = req.params.id;

  const result = await workScheduleService.deleteWorkSchedule(userId, scheduleId);

  success(res, result, result.message, 200);
});

/**
 * @desc    Assign employees to work schedule
 * @route   POST /api/work-schedules/:id/assign-employees
 * @access  Private (admin+, manager+)
 */
export const assignEmployeesToSchedule = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const scheduleId = req.params.id;

  const result = await workScheduleService.assignEmployeesToSchedule(
    userId,
    scheduleId,
    req.body
  );

  success(res, result, result.message, 200);
});

/**
 * @desc    Get employees assigned to schedule
 * @route   GET /api/work-schedules/:id/employees
 * @access  Private (admin+, manager+)
 */
export const getScheduleEmployees = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const userId = req.user.id;
  const scheduleId = req.params.id;
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    is_active: req.query.is_active,
  };

  const result = await workScheduleService.getScheduleEmployees(userId, scheduleId, filters);

  success(res, result, 'تم جلب الموظفين المرتبطين بالجدول بنجاح', 200);
});

/**
 * @desc    Remove employee from schedule
 * @route   DELETE /api/work-schedules/:id/employees/:employeeId
 * @access  Private (admin+, manager+)
 */
export const removeEmployeeFromSchedule = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const scheduleId = req.params.id;
  const employeeId = req.params.employeeId;

  const result = await workScheduleService.removeEmployeeFromSchedule(
    userId,
    scheduleId,
    employeeId
  );

  success(res, result, result.message, 200);
});
