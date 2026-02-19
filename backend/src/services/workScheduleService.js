import db from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

const { WorkSchedule, EmployeeSchedule, Employee, Organization, User } = db;

/**
 * Create a new work schedule
 */
export const createWorkSchedule = async (userId, scheduleData) => {
  // Get current user
  const currentUser = await User.findByPk(userId, {
    include: [{ model: Organization, as: 'organization' }]
  });

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Check if organization exists
  const organization = await Organization.findByPk(scheduleData.organization_id);
  if (!organization) {
    throw new AppError('المنظمة غير موجودة', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (scheduleData.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لإنشاء جدول دوام لهذه المنظمة', 403);
    }
  }

  // Check for duplicate name in same organization
  const existing = await WorkSchedule.findOne({
    where: {
      organization_id: scheduleData.organization_id,
      name: scheduleData.name,
    }
  });

  if (existing) {
    throw new AppError('يوجد جدول دوام بنفس الاسم في هذه المنظمة', 400);
  }

  // Create schedule
  const schedule = await WorkSchedule.create({
    organization_id: scheduleData.organization_id,
    name: scheduleData.name,
    name_ar: scheduleData.name_ar,
    start_time: scheduleData.start_time,
    end_time: scheduleData.end_time,
    work_days: scheduleData.work_days,
    late_grace_minutes: scheduleData.late_grace_minutes || 15,
    early_leave_grace_minutes: scheduleData.early_leave_grace_minutes || 15,
    expected_hours: scheduleData.expected_hours || 8.0,
    break_minutes: scheduleData.break_minutes || 60,
    is_flexible: scheduleData.is_flexible || false,
    description: scheduleData.description,
    is_active: true,
  });

  return schedule;
};

/**
 * Get all work schedules with filters
 */
export const getAllWorkSchedules = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Build query filters
  const where = {};

  // Filter by organization for non-super-admins
  if (currentUser.role !== 'super_admin') {
    where.organization_id = currentUser.organization_id;
  } else if (filters.organization_id) {
    where.organization_id = filters.organization_id;
  }

  // Filter by active status
  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active === 'true';
  }

  // Filter by flexible type
  if (filters.is_flexible !== undefined) {
    where.is_flexible = filters.is_flexible === 'true';
  }

  // Search by name
  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${filters.search}%` } },
      { name_ar: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const offset = (page - 1) * limit;

  // Fetch schedules
  const { count, rows: schedules } = await WorkSchedule.findAndCountAll({
    where,
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name'],
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true,
  });

  return {
    schedules,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Get work schedule by ID
 */
export const getWorkScheduleById = async (userId, scheduleId) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لعرض هذا الجدول', 403);
    }
  }

  return schedule;
};

/**
 * Update work schedule
 */
export const updateWorkSchedule = async (userId, scheduleId, updateData) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId);

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لتعديل هذا الجدول', 403);
    }
  }

  // Check for duplicate name if name is being updated
  if (updateData.name && updateData.name !== schedule.name) {
    const existing = await WorkSchedule.findOne({
      where: {
        organization_id: schedule.organization_id,
        name: updateData.name,
        id: { [Op.ne]: scheduleId },
      },
    });

    if (existing) {
      throw new AppError('يوجد جدول دوام آخر بنفس الاسم في هذه المنظمة', 400);
    }
  }

  // Update schedule
  await schedule.update(updateData);

  // Reload with associations
  await schedule.reload({
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name'],
      },
    ],
  });

  return schedule;
};

/**
 * Delete work schedule
 */
export const deleteWorkSchedule = async (userId, scheduleId) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId);

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لحذف هذا الجدول', 403);
    }
  }

  // Check if schedule has active employees
  const activeEmployees = await EmployeeSchedule.count({
    where: {
      schedule_id: scheduleId,
      is_active: true,
    },
  });

  if (activeEmployees > 0) {
    throw new AppError(
      `لا يمكن حذف هذا الجدول لأنه مرتبط بـ ${activeEmployees} موظف. قم بإلغاء ربطهم أولاً أو قم بإلغاء تفعيل الجدول بدلاً من حذفه`,
      400
    );
  }

  // Delete schedule
  await schedule.destroy();

  return { message: 'تم حذف جدول الدوام بنجاح' };
};

/**
 * Assign employees to work schedule
 */
export const assignEmployeesToSchedule = async (userId, scheduleId, assignmentData) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId);

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لتعديل هذا الجدول', 403);
    }
  }

  const { employee_ids, effective_from, effective_until } = assignmentData;

  // Verify all employees exist and belong to same organization
  const employees = await Employee.findAll({
    where: {
      id: { [Op.in]: employee_ids },
    },
  });

  if (employees.length !== employee_ids.length) {
    throw new AppError('بعض الموظفين غير موجودين', 404);
  }

  // Check if all employees belong to schedule's organization
  const wrongOrgEmployees = employees.filter(
    emp => emp.organization_id !== schedule.organization_id
  );

  if (wrongOrgEmployees.length > 0) {
    throw new AppError(
      'بعض الموظفين لا ينتمون لنفس منظمة الجدول',
      400
    );
  }

  // Deactivate existing active schedules for these employees
  await EmployeeSchedule.update(
    { is_active: false },
    {
      where: {
        employee_id: { [Op.in]: employee_ids },
        is_active: true,
      },
    }
  );

  // Create new assignments
  const effectiveFromDate = effective_from ? new Date(effective_from) : new Date();
  const effectiveUntilDate = effective_until ? new Date(effective_until) : null;

  const assignments = await Promise.all(
    employee_ids.map(employeeId =>
      EmployeeSchedule.create({
        employee_id: employeeId,
        schedule_id: scheduleId,
        effective_from: effectiveFromDate,
        effective_until: effectiveUntilDate,
        is_active: true,
      })
    )
  );

  return {
    message: `تم ربط ${employee_ids.length} موظف بجدول الدوام بنجاح`,
    assignments,
  };
};

/**
 * Get employees assigned to a schedule
 */
export const getScheduleEmployees = async (userId, scheduleId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId);

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لعرض هذا الجدول', 403);
    }
  }

  // Build query
  const where = { schedule_id: scheduleId };

  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active === 'true';
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const offset = (page - 1) * limit;

  // Fetch assignments
  const { count, rows: assignments } = await EmployeeSchedule.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_no', 'name', 'department', 'position', 'photo_url', 'is_active'],
      },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true,
  });

  // Transform data to include employee data at the top level with EmployeeSchedule data
  const employees = assignments.map(assignment => {
    const employee = assignment.employee ? assignment.employee.toJSON() : {};
    return {
      ...employee,
      EmployeeSchedule: {
        id: assignment.id,
        schedule_id: assignment.schedule_id,
        employee_id: assignment.employee_id,
        effective_from: assignment.effective_from,
        effective_until: assignment.effective_until,
        is_active: assignment.is_active,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at,
      }
    };
  });

  return {
    employees,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Remove employee from schedule
 */
export const removeEmployeeFromSchedule = async (userId, scheduleId, employeeId) => {
  // Get current user
  const currentUser = await User.findByPk(userId);

  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Find schedule
  const schedule = await WorkSchedule.findByPk(scheduleId);

  if (!schedule) {
    throw new AppError('جدول الدوام غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (schedule.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لتعديل هذا الجدول', 403);
    }
  }

  // Find assignment
  const assignment = await EmployeeSchedule.findOne({
    where: {
      schedule_id: scheduleId,
      employee_id: employeeId,
      is_active: true,
    },
  });

  if (!assignment) {
    throw new AppError('الموظف غير مرتبط بهذا الجدول', 404);
  }

  // Deactivate assignment
  await assignment.update({ is_active: false });

  return { message: 'تم إلغاء ربط الموظف بجدول الدوام بنجاح' };
};

/**
 * Get active schedule for employee on specific date
 */
export const getEmployeeScheduleOnDate = async (employeeId, date) => {
  const checkDate = new Date(date);

  const assignment = await EmployeeSchedule.findOne({
    where: {
      employee_id: employeeId,
      is_active: true,
      effective_from: { [Op.lte]: checkDate },
      [Op.or]: [
        { effective_until: null },
        { effective_until: { [Op.gte]: checkDate } },
      ],
    },
    include: [
      {
        model: WorkSchedule,
        as: 'schedule',
        where: { is_active: true },
      },
    ],
    order: [['effective_from', 'DESC']],
  });

  if (!assignment) {
    return null;
  }

  return assignment.schedule;
};
