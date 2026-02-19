# Work Schedule & Attendance API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Work Schedule Endpoints

### 1. Create Work Schedule

**POST** `/work-schedules`

Creates a new work schedule.

**Request Body:**
```json
{
  "name": "Morning Shift",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "work_days": [0, 1, 2, 3, 4],
  "expected_hours": 8,
  "late_grace_minutes": 15,
  "early_leave_grace_minutes": 15,
  "break_minutes": 60,
  "half_day_hours": 4,
  "is_flexible": false,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء جدول الدوام بنجاح",
  "data": {
    "schedule": {
      "id": 1,
      "organization_id": 1,
      "name": "Morning Shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "work_days": [0, 1, 2, 3, 4],
      "expected_hours": 8.0,
      "late_grace_minutes": 15,
      "early_leave_grace_minutes": 15,
      "break_minutes": 60,
      "half_day_hours": 4.0,
      "is_flexible": false,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**
- `name`: required, string, 1-100 characters, unique per organization
- `start_time`: required if not flexible, format HH:MM:SS
- `end_time`: required if not flexible, format HH:MM:SS
- `work_days`: required, array of integers 0-6
- `expected_hours`: required, number 1-24
- `late_grace_minutes`: optional, number 0-120, default 15
- `early_leave_grace_minutes`: optional, number 0-120, default 15
- `break_minutes`: optional, number 0-240, default 60
- `half_day_hours`: optional, number 1-12, default 4
- `is_flexible`: optional, boolean, default false
- `is_active`: optional, boolean, default true

---

### 2. Get All Work Schedules

**GET** `/work-schedules`

Retrieves all work schedules for the user's organization.

**Query Parameters:**
- `organization_id` (optional): Filter by organization (super_admin only)
- `is_active` (optional): Filter by active status (true/false)
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 50

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "name": "Morning Shift",
        "start_time": "08:00:00",
        "end_time": "17:00:00",
        "work_days": [0, 1, 2, 3, 4],
        "expected_hours": 8.0,
        "is_flexible": false,
        "is_active": true
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50,
      "total_pages": 1
    }
  }
}
```

---

### 3. Get Work Schedule by ID

**GET** `/work-schedules/:id`

Retrieves a specific work schedule.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "name": "Morning Shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "work_days": [0, 1, 2, 3, 4],
      "expected_hours": 8.0,
      "late_grace_minutes": 15,
      "early_leave_grace_minutes": 15,
      "break_minutes": 60,
      "half_day_hours": 4.0,
      "is_flexible": false,
      "is_active": true,
      "assigned_employees_count": 25
    }
  }
}
```

---

### 4. Update Work Schedule

**PUT** `/work-schedules/:id`

Updates an existing work schedule.

**Request Body:**
```json
{
  "name": "Updated Morning Shift",
  "late_grace_minutes": 20,
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث جدول الدوام بنجاح",
  "data": {
    "schedule": { /* updated schedule */ }
  }
}
```

---

### 5. Delete Work Schedule

**DELETE** `/work-schedules/:id`

Deletes a work schedule.

**Response (200):**
```json
{
  "success": true,
  "message": "تم حذف جدول الدوام بنجاح"
}
```

**Note:** Cannot delete if employees are assigned and active.

---

### 6. Assign Employees to Schedule

**POST** `/work-schedules/:id/assign-employees`

Assigns employees to a work schedule.

**Request Body:**
```json
{
  "employee_ids": [1, 2, 3, 4, 5],
  "effective_from": "2024-01-01",
  "effective_until": "2024-12-31"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تعيين 5 موظف بنجاح",
  "data": {
    "assigned_count": 5,
    "assignments": [
      {
        "id": 1,
        "employee_id": 1,
        "work_schedule_id": 1,
        "effective_from": "2024-01-01",
        "effective_until": "2024-12-31",
        "is_active": true
      }
    ]
  }
}
```

**Validation Rules:**
- `employee_ids`: required, array, minimum 1 employee
- `effective_from`: required, date (YYYY-MM-DD)
- `effective_until`: optional, date (YYYY-MM-DD), must be after effective_from

---

### 7. Get Schedule Employees

**GET** `/work-schedules/:id/employees`

Gets all employees assigned to a schedule.

**Query Parameters:**
- `is_active` (optional): Filter by active status
- `date` (optional): Get employees assigned on specific date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "name": "Morning Shift"
    },
    "employees": [
      {
        "id": 1,
        "full_name": "Ahmed Ali",
        "employee_code": "EMP001",
        "Department": {
          "id": 1,
          "name": "IT Department"
        },
        "EmployeeSchedule": {
          "effective_from": "2024-01-01",
          "effective_until": null,
          "is_active": true
        }
      }
    ],
    "total": 25
  }
}
```

---

### 8. Get Employee Schedule on Date

**GET** `/work-schedules/employee/:employeeId`

Gets the active work schedule for an employee on a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "id": 1,
      "name": "Morning Shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "work_days": [0, 1, 2, 3, 4],
      "expected_hours": 8.0,
      "late_grace_minutes": 15
    }
  }
}
```

---

## Attendance Report Endpoints

### 1. Daily Report

**GET** `/reports/attendance/daily`

Gets attendance records for a specific day.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `organization_id` (optional): Filter by organization
- `department_id` (optional): Filter by department
- `status` (optional): Filter by status (present/late/absent/half_day)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "records": [
      {
        "id": 1,
        "employee_id": 1,
        "date": "2024-01-15",
        "check_in_time": "08:05:00",
        "check_out_time": "17:10:00",
        "status": "late",
        "is_late": true,
        "late_minutes": 5,
        "working_hours": 8.5,
        "overtime_hours": 0.5,
        "break_hours": 1.0,
        "Employee": {
          "id": 1,
          "full_name": "Ahmed Ali",
          "employee_code": "EMP001"
        }
      }
    ],
    "statistics": {
      "total_employees": 50,
      "total_present": 45,
      "total_late": 8,
      "total_absent": 5,
      "total_half_day": 0,
      "total_overtime_hours": 12.5
    }
  }
}
```

---

### 2. Monthly Report

**GET** `/reports/attendance/monthly`

Gets monthly attendance summary for all employees.

**Query Parameters:**
- `year` (required): Year (YYYY)
- `month` (required): Month (1-12)
- `organization_id` (optional): Filter by organization
- `department_id` (optional): Filter by department
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 50

**Response (200):**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "report": [
      {
        "employee_id": 1,
        "employee_name": "Ahmed Ali",
        "employee_code": "EMP001",
        "department_name": "IT",
        "present_days": 20,
        "late_days": 3,
        "absent_days": 2,
        "half_days": 0,
        "total_working_hours": 160.5,
        "total_overtime_hours": 12.5,
        "total_late_minutes": 45,
        "attendance_rate": 90.91
      }
    ],
    "summary": {
      "total_employees": 50,
      "total_present_days": 980,
      "total_late_days": 45,
      "total_absent_days": 70,
      "total_working_hours": 7840.0,
      "total_overtime_hours": 156.5,
      "average_attendance_rate": 93.33
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 50,
      "total_pages": 1
    }
  }
}
```

---

### 3. Employee Monthly Report

**GET** `/reports/attendance/employee/:employeeId`

Gets detailed attendance for a specific employee for a month.

**Query Parameters:**
- `year` (required): Year (YYYY)
- `month` (required): Month (1-12)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "full_name": "Ahmed Ali",
      "employee_code": "EMP001"
    },
    "period": {
      "year": 2024,
      "month": 1
    },
    "records": [
      {
        "date": "2024-01-01",
        "check_in_time": "08:00:00",
        "check_out_time": "17:00:00",
        "status": "present",
        "working_hours": 8.0,
        "overtime_hours": 0.0
      }
    ],
    "summary": {
      "present_days": 20,
      "late_days": 3,
      "absent_days": 2,
      "total_working_hours": 160.5,
      "total_overtime_hours": 12.5,
      "attendance_rate": 90.91
    }
  }
}
```

---

### 4. Late Arrivals Report

**GET** `/reports/late-arrivals`

Gets all late arrival records.

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `organization_id` (optional)
- `department_id` (optional)
- `employee_id` (optional)
- `min_late_minutes` (optional): Minimum late minutes threshold

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "employee_id": 1,
        "date": "2024-01-15",
        "check_in_time": "08:25:00",
        "late_minutes": 25,
        "schedule_start_time": "08:00:00",
        "Employee": {
          "full_name": "Ahmed Ali",
          "employee_code": "EMP001"
        }
      }
    ],
    "statistics": {
      "total_late_instances": 45,
      "total_late_minutes": 675,
      "average_late_minutes": 15.0,
      "employees_affected": 20
    }
  }
}
```

---

### 5. Overtime Report

**GET** `/reports/overtime`

Gets all overtime records.

**Query Parameters:**
- `start_date` (required)
- `end_date` (required)
- `organization_id` (optional)
- `department_id` (optional)
- `employee_id` (optional)
- `min_overtime_hours` (optional): Minimum overtime threshold

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "employee_id": 1,
        "date": "2024-01-15",
        "working_hours": 10.5,
        "expected_hours": 8.0,
        "overtime_hours": 2.5,
        "Employee": {
          "full_name": "Ahmed Ali"
        }
      }
    ],
    "statistics": {
      "total_overtime_hours": 125.5,
      "total_overtime_days": 45,
      "average_overtime_hours": 2.79,
      "employees_with_overtime": 30
    }
  }
}
```

---

### 6. Absence Report

**GET** `/reports/absences`

Gets absence and half-day records.

**Query Parameters:**
- `start_date` (required)
- `end_date` (required)
- `organization_id` (optional)
- `department_id` (optional)
- `employee_id` (optional)
- `status` (optional): Filter by status (absent/half_day)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "employee_id": 1,
        "date": "2024-01-15",
        "status": "absent",
        "notes": null,
        "Employee": {
          "full_name": "Ahmed Ali",
          "Department": {
            "name": "IT"
          }
        }
      }
    ],
    "statistics": {
      "total_absences": 75,
      "total_half_days": 12,
      "total_affected_days": 87,
      "employees_affected": 25
    }
  }
}
```

---

### 7. Calculate Attendance

**POST** `/reports/attendance/calculate`

Manually calculates attendance for a date range.

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "employee_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم حساب الحضور بنجاح",
  "data": {
    "processed_records": 150,
    "updated_records": 145,
    "errors": 5
  }
}
```

---

### 8. Recalculate Attendance

**POST** `/reports/attendance/recalculate`

Forces recalculation of attendance (overwrites existing).

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "employee_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تمت إعادة حساب الحضور بنجاح",
  "data": {
    "recalculated_records": 150
  }
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "خطأ في البيانات المدخلة",
  "errors": [
    {
      "field": "start_time",
      "message": "يجب أن يكون بصيغة HH:MM:SS"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "غير مصرح بالدخول"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "ليس لديك صلاحية للقيام بهذا الإجراء"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "جدول الدوام غير موجود"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "حدث خطأ في الخادم"
}
```

---

## Date & Time Formats

- **Date**: `YYYY-MM-DD` (e.g., "2024-01-15")
- **Time**: `HH:MM:SS` (e.g., "08:30:00")
- **DateTime**: ISO 8601 format (e.g., "2024-01-15T08:30:00.000Z")

---

## Status Values

### Attendance Status
- `present`: حاضر
- `late`: متأخر
- `absent`: غائب
- `half_day`: نصف يوم
- `holiday`: عطلة

### Work Days (0 = Sunday)
- `0`: Sunday (أحد)
- `1`: Monday (إثنين)
- `2`: Tuesday (ثلاثاء)
- `3`: Wednesday (أربعاء)
- `4`: Thursday (خميس)
- `5`: Friday (جمعة)
- `6`: Saturday (سبت)

---

## Rate Limiting

- **General**: 100 requests/minute per user
- **Reports**: 20 requests/minute per user (due to heavy queries)

---

## Pagination

Default pagination format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "total_pages": 5
  }
}
```

---

## Testing

Use the provided test file:
```bash
cd backend
node test-work-schedule.js
```

---

**Last Updated**: January 2024  
**API Version**: 1.0.0
