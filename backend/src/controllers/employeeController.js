import asyncHandler from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';
import { AppError } from '../middlewares/errorHandler.js';
import * as employeeService from '../services/employeeService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private (admin+, manager+, employees.read)
 */
export const getEmployees = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    department: req.query.department,
    is_active: req.query.is_active,
    sort_by: req.query.sort_by,
    sort_order: req.query.sort_order
  };

  const result = await employeeService.getAllEmployees(userId, filters);
  
  success(res, result, 'تم جلب قائمة الموظفين بنجاح', 200);
});

/**
 * @desc    Get single employee
 * @route   GET /api/employees/:id
 * @access  Private (admin+, manager+, employees.read)
 */
export const getEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;

  const employee = await employeeService.getEmployeeById(userId, employeeId);
  
  success(res, employee, 'تم جلب بيانات الموظف بنجاح', 200);
});

/**
 * @desc    Create new employee
 * @route   POST /api/employees
 * @access  Private (admin+, employees.create)
 */
export const createEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const employee = await employeeService.createEmployee(userId, req.body, ipAddress);
  
  success(res, employee, 'تم إنشاء الموظف بنجاح', 201);
});

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Private (admin+, employees.update)
 */
export const updateEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const employee = await employeeService.updateEmployee(userId, employeeId, req.body, ipAddress);
  
  success(res, employee, 'تم تحديث بيانات الموظف بنجاح', 200);
});

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Private (admin+, employees.delete)
 */
export const deleteEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const result = await employeeService.deleteEmployee(userId, employeeId, ipAddress);
  
  success(res, result.message, null, 200);
});

/**
 * @desc    Activate employee
 * @route   POST /api/employees/:id/activate
 * @access  Private (admin+, employees.update)
 */
export const activateEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const employee = await employeeService.activateEmployee(userId, employeeId, ipAddress);
  
  success(res, employee, 'تم تفعيل الموظف بنجاح', 200);
});

/**
 * @desc    Deactivate employee
 * @route   POST /api/employees/:id/deactivate
 * @access  Private (admin+, employees.update)
 */
export const deactivateEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const employee = await employeeService.deactivateEmployee(userId, employeeId, ipAddress);
  
  success(res, employee, 'تم تعطيل الموظف بنجاح', 200);
});

/**
 * @desc    Get employee biometrics
 * @route   GET /api/employees/:id/biometrics
 * @access  Private (admin+, manager+, employees.read)
 */
export const getEmployeeBiometrics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  
  const biometrics = await employeeService.getEmployeeBiometrics(userId, employeeId);
  
  success(res, biometrics, 'تم جلب البيانات البيومترية بنجاح', 200);
});

/**
 * @desc    Get departments
 * @route   GET /api/employees/departments/list
 * @access  Private (admin+, manager+)
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const departments = await employeeService.getDepartments(userId);
  
  success(res, departments, 'تم جلب قائمة الأقسام بنجاح', 200);
});

/**
 * @desc    Get employee statistics
 * @route   GET /api/employees/stats/overview
 * @access  Private (admin+, manager+)
 */
export const getEmployeeStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const stats = await employeeService.getEmployeeStats(userId);
  
  success(res, stats, 'تم جلب الإحصائيات بنجاح', 200);
});

/**
 * @desc    Upload employee photo
 * @route   POST /api/employees/:id/photo
 * @access  Private (admin+, employees.update)
 */
export const uploadEmployeePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (!req.processedFile) {
    throw new AppError('فشل في معالجة الصورة', 500);
  }

  // Build relative URL for photo
  const photoUrl = `/uploads/employees/photos/${req.processedFile.filename}`;

  const employee = await employeeService.updateEmployeePhoto(
    userId, 
    employeeId, 
    photoUrl,
    ipAddress
  );

  success(res, employee, 'تم رفع صورة الموظف بنجاح', 200);
});

/**
 * @desc    Get employee photo
 * @route   GET /api/employees/:id/photo
 * @access  Private (admin+, manager+, employees.read)
 */
export const getEmployeePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;

  const employee = await employeeService.getEmployeeById(userId, employeeId);

  if (!employee.photo_url) {
    throw new AppError('لا توجد صورة لهذا الموظف', 404);
  }

  const photoPath = path.join(__dirname, '../..', employee.photo_url);

  if (!fs.existsSync(photoPath)) {
    throw new AppError('الصورة غير موجودة', 404);
  }

  res.sendFile(photoPath);
});

/**
 * @desc    Delete employee photo
 * @route   DELETE /api/employees/:id/photo
 * @access  Private (admin+, employees.delete)
 */
export const deleteEmployeePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const employeeId = req.params.id;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const employee = await employeeService.updateEmployeePhoto(
    userId,
    employeeId,
    null,
    ipAddress
  );

  success(res, employee, 'تم حذف صورة الموظف بنجاح', 200);
});
