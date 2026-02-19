import db from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns';
import * as attendanceCalculationService from './attendanceCalculationService.js';

const { AttendanceSummary, AttendanceLog, Employee, Organization, User, WorkSchedule, EmployeeSchedule } = db;

/**
 * Get daily attendance report
 */
export const getDailyReport = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { date, organization_id, status } = filters;
  const reportDate = date ? new Date(date) : new Date();
  const dateOnly = format(reportDate, 'yyyy-MM-dd');

  // Build query
  const where = { date: dateOnly };

  // Filter by organization for non-super-admins
  if (currentUser.role !== 'super_admin') {
    const orgEmployees = await Employee.findAll({
      where: { organization_id: currentUser.organization_id },
      attributes: ['id'],
    });
    where.employee_id = { [Op.in]: orgEmployees.map(e => e.id) };
  } else if (organization_id) {
    const orgEmployees = await Employee.findAll({
      where: { organization_id },
      attributes: ['id'],
    });
    where.employee_id = { [Op.in]: orgEmployees.map(e => e.id) };
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Fetch summaries
  const summaries = await AttendanceSummary.findAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employee_no', 'name', 'department', 'position', 'photo_url'],
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    order: [['employee_id', 'ASC']],
  });

  // Calculate statistics
  const stats = {
    total: summaries.length,
    present: summaries.filter(s => s.status === 'present').length,
    late: summaries.filter(s => s.status === 'late').length,
    absent: summaries.filter(s => s.status === 'absent').length,
    half_day: summaries.filter(s => s.status === 'half_day').length,
    holiday: summaries.filter(s => s.status === 'holiday').length,
    leave: summaries.filter(s => s.status === 'leave').length,
    total_working_hours: summaries.reduce((sum, s) => sum + (parseFloat(s.working_hours) || 0), 0),
    total_overtime_hours: summaries.reduce((sum, s) => sum + (parseFloat(s.overtime_hours) || 0), 0),
  };

  return {
    date: dateOnly,
    stats,
    records: summaries.map(s => ({
      employee_id: s.employee.id,
      employee_no: s.employee.employee_no,
      employee_name: s.employee.name,
      department: s.employee.department,
      position: s.employee.position,
      organization: s.employee.organization?.name,
      check_in_time: s.check_in_time,
      check_out_time: s.check_out_time,
      status: s.status,
      is_late: s.is_late,
      late_minutes: s.late_minutes,
      working_hours: s.working_hours,
      overtime_hours: s.overtime_hours,
      notes: s.notes,
    })),
  };
};

/**
 * Get monthly attendance report for a specific employee
 */
export const getMonthlyEmployeeReport = async (userId, employeeId, year, month) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Get employee
  const employee = await Employee.findByPk(employeeId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Check authorization
  if (currentUser.role !== 'super_admin') {
    if (employee.organization_id !== currentUser.organization_id) {
      throw new AppError('ليس لديك صلاحية لعرض بيانات هذا الموظف', 403);
    }
  }

  // Get date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  const startDateOnly = format(startDate, 'yyyy-MM-dd');
  const endDateOnly = format(endDate, 'yyyy-MM-dd');

  // Fetch summaries
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: employeeId,
      date: {
        [Op.between]: [startDateOnly, endDateOnly],
      },
    },
    order: [['date', 'ASC']],
  });

  // Calculate statistics
  const stats = await attendanceCalculationService.getAttendanceStatistics(
    employeeId,
    startDateOnly,
    endDateOnly
  );

  return {
    employee: {
      id: employee.id,
      employee_no: employee.employee_no,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      organization: employee.organization?.name,
    },
    period: {
      year,
      month,
      start_date: startDateOnly,
      end_date: endDateOnly,
    },
    stats,
    days: summaries.map(s => ({
      date: s.date,
      check_in_time: s.check_in_time,
      check_out_time: s.check_out_time,
      status: s.status,
      is_late: s.is_late,
      late_minutes: s.late_minutes,
      is_early_leave: s.is_early_leave,
      early_leave_minutes: s.early_leave_minutes,
      working_hours: s.working_hours,
      overtime_hours: s.overtime_hours,
      notes: s.notes,
    })),
  };
};

/**
 * Get monthly attendance report for all employees
 */
export const getMonthlyReport = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { year, month, organization_id, department, page = 1, limit = 50 } = filters;

  // Get date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  const startDateOnly = format(startDate, 'yyyy-MM-dd');
  const endDateOnly = format(endDate, 'yyyy-MM-dd');

  // Build employee filter
  const employeeWhere = {};

  if (currentUser.role !== 'super_admin') {
    employeeWhere.organization_id = currentUser.organization_id;
  } else if (organization_id) {
    employeeWhere.organization_id = organization_id;
  }

  if (department) {
    employeeWhere.department = department;
  }

  employeeWhere.is_active = true;

  // Get employees
  const { count, rows: employees } = await Employee.findAndCountAll({
    where: employeeWhere,
    attributes: ['id', 'employee_no', 'name', 'department', 'position'],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['employee_no', 'ASC']],
  });

  // Get summaries for all these employees
  const employeeIds = employees.map(e => e.id);
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: { [Op.in]: employeeIds },
      date: {
        [Op.between]: [startDateOnly, endDateOnly],
      },
    },
  });

  // Group summaries by employee
  const summariesByEmployee = {};
  summaries.forEach(s => {
    if (!summariesByEmployee[s.employee_id]) {
      summariesByEmployee[s.employee_id] = [];
    }
    summariesByEmployee[s.employee_id].push(s);
  });

  // Build report for each employee
  const employeeReports = employees.map(employee => {
    const empSummaries = summariesByEmployee[employee.id] || [];

    const stats = {
      total_days: empSummaries.length,
      present_days: empSummaries.filter(s => s.status === 'present').length,
      late_days: empSummaries.filter(s => s.status === 'late').length,
      absent_days: empSummaries.filter(s => s.status === 'absent').length,
      half_days: empSummaries.filter(s => s.status === 'half_day').length,
      holidays: empSummaries.filter(s => s.status === 'holiday').length,
      leaves: empSummaries.filter(s => s.status === 'leave').length,
      total_late_minutes: empSummaries.reduce((sum, s) => sum + (s.late_minutes || 0), 0),
      total_working_hours: empSummaries.reduce((sum, s) => sum + (parseFloat(s.working_hours) || 0), 0),
      total_overtime_hours: empSummaries.reduce((sum, s) => sum + (parseFloat(s.overtime_hours) || 0), 0),
    };

    return {
      employee_id: employee.id,
      employee_no: employee.employee_no,
      employee_name: employee.name,
      department: employee.department,
      position: employee.position,
      stats,
    };
  });

  return {
    period: {
      year,
      month,
      start_date: startDateOnly,
      end_date: endDateOnly,
    },
    employees: employeeReports,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  };
};

/**
 * Get late arrivals report
 */
export const getLateArrivalsReport = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { start_date, end_date, organization_id, department, min_late_minutes = 1 } = filters;

  // Build employee filter
  const employeeWhere = {};

  if (currentUser.role !== 'super_admin') {
    employeeWhere.organization_id = currentUser.organization_id;
  } else if (organization_id) {
    employeeWhere.organization_id = organization_id;
  }

  if (department) {
    employeeWhere.department = department;
  }

  // Get employees
  const employees = await Employee.findAll({
    where: employeeWhere,
    attributes: ['id', 'employee_no', 'name', 'department', 'position'],
  });

  const employeeIds = employees.map(e => e.id);

  // Get late attendance records
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: { [Op.in]: employeeIds },
      date: {
        [Op.between]: [start_date, end_date],
      },
      is_late: true,
      late_minutes: { [Op.gte]: parseInt(min_late_minutes) },
    },
    order: [['date', 'DESC'], ['late_minutes', 'DESC']],
  });

  // Group by employee
  const lateRecordsByEmployee = {};
  summaries.forEach(s => {
    if (!lateRecordsByEmployee[s.employee_id]) {
      lateRecordsByEmployee[s.employee_id] = [];
    }
    lateRecordsByEmployee[s.employee_id].push({
      date: s.date,
      check_in_time: s.check_in_time,
      late_minutes: s.late_minutes,
      status: s.status,
    });
  });

  // Build report
  const lateEmployees = employees
    .map(employee => {
      const records = lateRecordsByEmployee[employee.id] || [];
      if (records.length === 0) return null;

      const totalLateMinutes = records.reduce((sum, r) => sum + r.late_minutes, 0);

      return {
        employee_id: employee.id,
        employee_no: employee.employee_no,
        employee_name: employee.name,
        department: employee.department,
        position: employee.position,
        total_late_days: records.length,
        total_late_minutes: totalLateMinutes,
        average_late_minutes: Math.round(totalLateMinutes / records.length),
        late_records: records,
      };
    })
    .filter(e => e !== null)
    .sort((a, b) => b.total_late_days - a.total_late_days);

  // Calculate summary
  const summary = {
    total_employees: employees.length,
    late_employees_count: lateEmployees.length,
    late_percentage: employees.length > 0
      ? parseFloat(((lateEmployees.length / employees.length) * 100).toFixed(2))
      : 0,
    total_late_incidents: summaries.length,
  };

  return {
    period: {
      start_date,
      end_date,
    },
    summary,
    late_employees: lateEmployees,
  };
};

/**
 * Get overtime report
 */
export const getOvertimeReport = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { start_date, end_date, organization_id, department, min_overtime_hours = 0.5 } = filters;

  // Build employee filter
  const employeeWhere = {};

  if (currentUser.role !== 'super_admin') {
    employeeWhere.organization_id = currentUser.organization_id;
  } else if (organization_id) {
    employeeWhere.organization_id = organization_id;
  }

  if (department) {
    employeeWhere.department = department;
  }

  // Get employees
  const employees = await Employee.findAll({
    where: employeeWhere,
    attributes: ['id', 'employee_no', 'name', 'department', 'position'],
  });

  const employeeIds = employees.map(e => e.id);

  // Get overtime records
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: { [Op.in]: employeeIds },
      date: {
        [Op.between]: [start_date, end_date],
      },
      overtime_hours: { [Op.gte]: parseFloat(min_overtime_hours) },
    },
    order: [['date', 'DESC'], ['overtime_hours', 'DESC']],
  });

  // Group by employee
  const overtimeByEmployee = {};
  summaries.forEach(s => {
    if (!overtimeByEmployee[s.employee_id]) {
      overtimeByEmployee[s.employee_id] = [];
    }
    overtimeByEmployee[s.employee_id].push({
      date: s.date,
      check_in_time: s.check_in_time,
      check_out_time: s.check_out_time,
      working_hours: s.working_hours,
      overtime_hours: s.overtime_hours,
    });
  });

  // Build report
  const overtimeEmployees = employees
    .map(employee => {
      const records = overtimeByEmployee[employee.id] || [];
      if (records.length === 0) return null;

      const totalOvertimeHours = records.reduce((sum, r) => sum + parseFloat(r.overtime_hours), 0);

      return {
        employee_id: employee.id,
        employee_no: employee.employee_no,
        employee_name: employee.name,
        department: employee.department,
        position: employee.position,
        total_overtime_days: records.length,
        total_overtime_hours: parseFloat(totalOvertimeHours.toFixed(2)),
        overtime_records: records,
      };
    })
    .filter(e => e !== null)
    .sort((a, b) => b.total_overtime_hours - a.total_overtime_hours);

  // Calculate summary
  const summary = {
    total_employees: employees.length,
    employees_with_overtime: overtimeEmployees.length,
    total_overtime_hours: overtimeEmployees.reduce((sum, e) => sum + e.total_overtime_hours, 0),
  };

  return {
    period: {
      start_date,
      end_date,
    },
    summary,
    overtime_employees: overtimeEmployees,
  };
};

/**
 * Get absence report
 */
export const getAbsenceReport = async (userId, filters) => {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const { start_date, end_date, organization_id, department } = filters;

  // Build employee filter
  const employeeWhere = {};

  if (currentUser.role !== 'super_admin') {
    employeeWhere.organization_id = currentUser.organization_id;
  } else if (organization_id) {
    employeeWhere.organization_id = organization_id;
  }

  if (department) {
    employeeWhere.department = department;
  }

  // Get employees
  const employees = await Employee.findAll({
    where: employeeWhere,
    attributes: ['id', 'employee_no', 'name', 'department', 'position'],
  });

  const employeeIds = employees.map(e => e.id);

  // Get absence records
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: { [Op.in]: employeeIds },
      date: {
        [Op.between]: [start_date, end_date],
      },
      status: 'absent',
    },
    order: [['date', 'DESC']],
  });

  // Group by employee
  const absencesByEmployee = {};
  summaries.forEach(s => {
    if (!absencesByEmployee[s.employee_id]) {
      absencesByEmployee[s.employee_id] = [];
    }
    absencesByEmployee[s.employee_id].push({
      date: s.date,
      notes: s.notes,
    });
  });

  // Build report
  const absentEmployees = employees
    .map(employee => {
      const records = absencesByEmployee[employee.id] || [];
      if (records.length === 0) return null;

      return {
        employee_id: employee.id,
        employee_no: employee.employee_no,
        employee_name: employee.name,
        department: employee.department,
        position: employee.position,
        total_absent_days: records.length,
        absence_records: records,
      };
    })
    .filter(e => e !== null)
    .sort((a, b) => b.total_absent_days - a.total_absent_days);

  // Calculate summary
  const summary = {
    total_employees: employees.length,
    employees_with_absences: absentEmployees.length,
    total_absence_days: summaries.length,
  };

  return {
    period: {
      start_date,
      end_date,
    },
    summary,
    absent_employees: absentEmployees,
  };
};
