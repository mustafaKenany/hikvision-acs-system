import db from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';
import { format, startOfDay, endOfDay, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';
import * as workScheduleService from './workScheduleService.js';

const { AttendanceLog, AttendanceSummary, Employee, WorkSchedule, EmployeeSchedule } = db;

/**
 * Calculate daily attendance for an employee
 * This function processes all check-in/check-out events for a specific date
 * and creates/updates the AttendanceSummary record
 */
export const calculateDailyAttendance = async (employeeId, date) => {
  const checkDate = new Date(date);
  const dateOnly = format(checkDate, 'yyyy-MM-dd');

  // Get employee
  const employee = await Employee.findByPk(employeeId);
  if (!employee || !employee.is_active) {
    throw new AppError('الموظف غير موجود أو غير نشط', 404);
  }

  // Get employee's active work schedule for this date
  const schedule = await workScheduleService.getEmployeeScheduleOnDate(employeeId, checkDate);

  // If no schedule, mark as absent (or could be leave/holiday)
  if (!schedule) {
    await upsertAttendanceSummary({
      employee_id: employeeId,
      date: dateOnly,
      status: 'absent',
      notes: 'لا يوجد جدول دوام محدد لهذا التاريخ',
    });
    return;
  }

  // Check if this is a work day
  const dayOfWeek = checkDate.getDay();
  if (!schedule.work_days.includes(dayOfWeek)) {
    await upsertAttendanceSummary({
      employee_id: employeeId,
      date: dateOnly,
      status: 'holiday',
      notes: 'يوم عطلة حسب جدول الدوام',
    });
    return;
  }

  // Get all attendance logs for this employee on this date
  const logs = await AttendanceLog.findAll({
    where: {
      employee_id: employeeId,
      event_time: {
        [Op.between]: [startOfDay(checkDate), endOfDay(checkDate)],
      },
      is_successful: true,
    },
    order: [['event_time', 'ASC']],
  });

  // If no logs, mark as absent
  if (logs.length === 0) {
    await upsertAttendanceSummary({
      employee_id: employeeId,
      date: dateOnly,
      status: 'absent',
      notes: 'لم يتم تسجيل أي حضور',
    });
    return;
  }

  // Find first check-in and last check-out
  const checkInLog = logs.find(log => log.event_type === 'check_in');
  const checkOutLog = logs.reverse().find(log => log.event_type === 'check_out');

  // If no check-in, can't calculate
  if (!checkInLog) {
    await upsertAttendanceSummary({
      employee_id: employeeId,
      date: dateOnly,
      status: 'absent',
      notes: 'لم يتم تسجيل دخول',
    });
    return;
  }

  const checkInTime = new Date(checkInLog.event_time);
  const checkOutTime = checkOutLog ? new Date(checkOutLog.event_time) : null;

  // Calculate lateness
  const { isLate, lateMinutes } = calculateLateness(checkInTime, schedule, checkDate);

  // Calculate early leave
  const { isEarlyLeave, earlyLeaveMinutes } = checkOutTime
    ? calculateEarlyLeave(checkOutTime, schedule, checkDate)
    : { isEarlyLeave: false, earlyLeaveMinutes: 0 };

  // Calculate working hours
  const { workingHours, overtimeHours, breakHours } = checkOutTime
    ? calculateWorkingHours(checkInTime, checkOutTime, logs, schedule)
    : { workingHours: 0, overtimeHours: 0, breakHours: 0 };

  // Determine status
  const status = determineStatus({
    hasCheckOut: !!checkOutTime,
    isLate,
    workingHours,
    expectedHours: parseFloat(schedule.expected_hours),
    isFlexible: schedule.is_flexible,
  });

  // Create or update attendance summary
  await upsertAttendanceSummary({
    employee_id: employeeId,
    date: dateOnly,
    check_in_time: checkInTime,
    check_out_time: checkOutTime,
    status,
    is_late: isLate,
    late_minutes: lateMinutes,
    is_early_leave: isEarlyLeave,
    early_leave_minutes: earlyLeaveMinutes,
    working_hours: workingHours,
    overtime_hours: overtimeHours,
    break_hours: breakHours,
  });

  return {
    employee_id: employeeId,
    date: dateOnly,
    status,
    check_in_time: checkInTime,
    check_out_time: checkOutTime,
    is_late: isLate,
    late_minutes: lateMinutes,
    working_hours: workingHours,
    overtime_hours: overtimeHours,
  };
};

/**
 * Calculate if employee is late and by how many minutes
 */
function calculateLateness(checkInTime, schedule, date) {
  // For flexible schedules, no lateness concept
  if (schedule.is_flexible) {
    return { isLate: false, lateMinutes: 0 };
  }

  // Parse schedule start time
  const [hours, minutes, seconds] = schedule.start_time.split(':').map(Number);
  const scheduleStartTime = new Date(date);
  scheduleStartTime.setHours(hours, minutes, seconds || 0, 0);

  // Add grace period
  const lateThreshold = new Date(scheduleStartTime);
  lateThreshold.setMinutes(lateThreshold.getMinutes() + (schedule.late_grace_minutes || 0));

  // Calculate difference
  if (checkInTime <= lateThreshold) {
    return { isLate: false, lateMinutes: 0 };
  }

  const lateMinutes = differenceInMinutes(checkInTime, scheduleStartTime);
  return {
    isLate: true,
    lateMinutes: Math.max(0, lateMinutes - (schedule.late_grace_minutes || 0)),
  };
}

/**
 * Calculate if employee left early and by how many minutes
 */
function calculateEarlyLeave(checkOutTime, schedule, date) {
  // For flexible schedules, no early leave concept
  if (schedule.is_flexible) {
    return { isEarlyLeave: false, earlyLeaveMinutes: 0 };
  }

  // Parse schedule end time
  const [hours, minutes, seconds] = schedule.end_time.split(':').map(Number);
  const scheduleEndTime = new Date(date);
  scheduleEndTime.setHours(hours, minutes, seconds || 0, 0);

  // Subtract grace period
  const earlyThreshold = new Date(scheduleEndTime);
  earlyThreshold.setMinutes(earlyThreshold.getMinutes() - (schedule.early_leave_grace_minutes || 0));

  // Calculate difference
  if (checkOutTime >= earlyThreshold) {
    return { isEarlyLeave: false, earlyLeaveMinutes: 0 };
  }

  const earlyMinutes = differenceInMinutes(scheduleEndTime, checkOutTime);
  return {
    isEarlyLeave: true,
    earlyLeaveMinutes: Math.max(0, earlyMinutes - (schedule.early_leave_grace_minutes || 0)),
  };
}

/**
 * Calculate working hours, overtime, and break time
 */
function calculateWorkingHours(checkInTime, checkOutTime, logs, schedule) {
  // Calculate total time between check-in and check-out
  const totalMinutes = differenceInMinutes(checkOutTime, checkInTime);

  // Calculate break time from break_start and break_end logs
  let breakMinutes = 0;
  const breakStarts = logs.filter(log => log.event_type === 'break_start');
  const breakEnds = logs.filter(log => log.event_type === 'break_end');

  for (let i = 0; i < Math.min(breakStarts.length, breakEnds.length); i++) {
    const breakStart = new Date(breakStarts[i].event_time);
    const breakEnd = new Date(breakEnds[i].event_time);
    if (breakEnd > breakStart) {
      breakMinutes += differenceInMinutes(breakEnd, breakStart);
    }
  }

  // If no break logs, use default break time from schedule
  if (breakMinutes === 0 && schedule.break_minutes > 0) {
    breakMinutes = schedule.break_minutes;
  }

  const breakHours = parseFloat((breakMinutes / 60).toFixed(2));

  // Calculate net working hours
  const netMinutes = totalMinutes - breakMinutes;
  const workingHours = parseFloat((netMinutes / 60).toFixed(2));

  // Calculate overtime
  const expectedHours = parseFloat(schedule.expected_hours);
  const overtimeHours = workingHours > expectedHours
    ? parseFloat((workingHours - expectedHours).toFixed(2))
    : 0;

  return {
    workingHours: Math.max(0, workingHours),
    overtimeHours,
    breakHours,
  };
}

/**
 * Determine attendance status based on various factors
 */
function determineStatus({ hasCheckOut, isLate, workingHours, expectedHours, isFlexible }) {
  // If no check-out yet, return present or late
  if (!hasCheckOut) {
    return isLate ? 'late' : 'present';
  }

  // For flexible schedules, check if they met expected hours
  if (isFlexible) {
    if (workingHours >= expectedHours) {
      return 'present';
    } else if (workingHours >= expectedHours / 2) {
      return 'half_day';
    } else {
      return 'absent';
    }
  }

  // For fixed schedules
  if (isLate) {
    return 'late';
  }

  if (workingHours >= expectedHours * 0.9) {
    // Within 90% of expected hours = present
    return 'present';
  } else if (workingHours >= expectedHours / 2) {
    return 'half_day';
  } else {
    return 'absent';
  }
}

/**
 * Create or update attendance summary record
 */
async function upsertAttendanceSummary(data) {
  const [summary, created] = await AttendanceSummary.findOrCreate({
    where: {
      employee_id: data.employee_id,
      date: data.date,
    },
    defaults: data,
  });

  if (!created) {
    await summary.update(data);
  }

  return summary;
}

/**
 * Process a new attendance log and update summary
 * Called when a new check-in/check-out event occurs
 */
export const processAttendanceLog = async (log) => {
  const logDate = new Date(log.event_time);
  await calculateDailyAttendance(log.employee_id, logDate);
};

/**
 * Calculate monthly attendance for an employee
 * Processes all days of the month
 */
export const calculateMonthlyAttendance = async (employeeId, year, month) => {
  // Validate inputs
  if (!employeeId || !year || !month) {
    throw new AppError('معرف الموظف والسنة والشهر مطلوبة', 400);
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Get number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const results = [];

  // Process each day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    
    // Don't process future dates
    if (date > new Date()) {
      break;
    }

    try {
      const result = await calculateDailyAttendance(employeeId, date);
      results.push(result);
    } catch (error) {
      console.error(`Error calculating attendance for ${employeeId} on ${date}:`, error);
      results.push({
        employee_id: employeeId,
        date: format(date, 'yyyy-MM-dd'),
        status: 'error',
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Calculate attendance for all active employees on a specific date
 * Useful for batch processing (e.g., cron job at end of day)
 */
export const calculateAttendanceForAllEmployees = async (date) => {
  const checkDate = date ? new Date(date) : new Date();

  // Get all active employees
  const employees = await Employee.findAll({
    where: { is_active: true },
    attributes: ['id', 'employee_no', 'name'],
  });

  console.log(`Processing attendance for ${employees.length} employees on ${format(checkDate, 'yyyy-MM-dd')}`);

  const results = {
    total: employees.length,
    processed: 0,
    errors: 0,
    details: [],
  };

  // Process each employee
  for (const employee of employees) {
    try {
      await calculateDailyAttendance(employee.id, checkDate);
      results.processed++;
      results.details.push({
        employee_id: employee.id,
        employee_no: employee.employee_no,
        name: employee.name,
        status: 'success',
      });
    } catch (error) {
      console.error(`Error calculating attendance for employee ${employee.id}:`, error);
      results.errors++;
      results.details.push({
        employee_id: employee.id,
        employee_no: employee.employee_no,
        name: employee.name,
        status: 'error',
        error: error.message,
      });
    }
  }

  console.log(`Attendance calculation complete: ${results.processed} processed, ${results.errors} errors`);

  return results;
};

/**
 * Get attendance summary statistics for an employee in a date range
 */
export const getAttendanceStatistics = async (employeeId, startDate, endDate) => {
  const summaries = await AttendanceSummary.findAll({
    where: {
      employee_id: employeeId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const stats = {
    total_days: summaries.length,
    present_days: summaries.filter(s => s.status === 'present').length,
    late_days: summaries.filter(s => s.status === 'late').length,
    absent_days: summaries.filter(s => s.status === 'absent').length,
    half_days: summaries.filter(s => s.status === 'half_day').length,
    holidays: summaries.filter(s => s.status === 'holiday').length,
    leaves: summaries.filter(s => s.status === 'leave').length,
    total_late_minutes: summaries.reduce((sum, s) => sum + (s.late_minutes || 0), 0),
    total_working_hours: summaries.reduce((sum, s) => sum + (parseFloat(s.working_hours) || 0), 0),
    total_overtime_hours: summaries.reduce((sum, s) => sum + (parseFloat(s.overtime_hours) || 0), 0),
    average_working_hours: 0,
    average_late_minutes: 0,
  };

  // Calculate averages
  const workingDays = stats.present_days + stats.late_days;
  if (workingDays > 0) {
    stats.average_working_hours = parseFloat((stats.total_working_hours / workingDays).toFixed(2));
  }

  if (stats.late_days > 0) {
    stats.average_late_minutes = Math.round(stats.total_late_minutes / stats.late_days);
  }

  return stats;
};

/**
 * Recalculate attendance for a date range (useful for corrections)
 */
export const recalculateAttendanceRange = async (employeeId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const results = [];

  let currentDate = new Date(start);
  while (currentDate <= end) {
    try {
      const result = await calculateDailyAttendance(employeeId, currentDate);
      results.push(result);
    } catch (error) {
      console.error(`Error recalculating attendance for ${employeeId} on ${currentDate}:`, error);
      results.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        error: error.message,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
};
