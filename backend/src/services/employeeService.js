import { Op } from 'sequelize';
import models from '../models/index.js';
const { Employee, Organization, FaceTemplate, FingerprintTemplate, CardTemplate, AuditLog, User } = models;
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Get all employees with pagination, search, and filters
 */
export async function getAllEmployees(
  userId,
  { page = 1, limit = 10, search = '', department = '', is_active = '', sort_by = 'created_at', sort_order = 'DESC' }
) {
  // Get current user
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {};

  // Organization isolation - users can only see employees from their organization
  // Exception: super_admin can see all employees
  if (currentUser.role !== 'super_admin') {
    whereClause.organization_id = currentUser.organization_id;
  }

  // Search in name, name_ar, employee_no, email
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { name_ar: { [Op.iLike]: `%${search}%` } },
      { employee_no: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Filter by department
  if (department) {
    whereClause.department = department;
  }

  // Filter by active status
  if (is_active !== '') {
    whereClause.is_active = is_active === 'true' || is_active === true;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Valid sort fields
  const validSortFields = ['created_at', 'name', 'employee_no', 'department', 'hire_date'];
  const orderBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';
  const order = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Fetch employees
  const { count, rows: employees } = await Employee.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      }
    ],
    limit: parseInt(limit),
    offset: offset,
    order: [[orderBy, order]],
    distinct: true
  });

  // Get biometric counts for each employee
  const employeesWithCounts = await Promise.all(
    employees.map(async (emp) => {
      const [faceCount, fingerprintCount, cardCount] = await Promise.all([
        FaceTemplate.count({ where: { employee_id: emp.id } }),
        FingerprintTemplate.count({ where: { employee_id: emp.id } }),
        CardTemplate.count({ where: { employee_id: emp.id } })
      ]);

      return {
        ...emp.toJSON(),
        biometric_counts: {
          faces: faceCount,
          fingerprints: fingerprintCount,
          cards: cardCount
        }
      };
    })
  );

  return {
    employees: employeesWithCounts,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / limit)
    }
  };
}

/**
 * Get single employee by ID with full details
 */
export async function getEmployeeById(requesterId, employeeId) {
  const requester = await User.findByPk(requesterId);
  if (!requester) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findByPk(employeeId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      },
      {
        model: FaceTemplate,
        as: 'faces',
        attributes: ['id', 'template_data', 'quality_score', 'created_at']
      },
      {
        model: FingerprintTemplate,
        as: 'fingerprints',
        attributes: ['id', 'finger_number', 'template_data', 'quality_score', 'created_at']
      },
      {
        model: CardTemplate,
        as: 'cards',
        attributes: ['id', 'card_number', 'card_type', 'is_active', 'created_at']
      }
    ]
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (requester.role !== 'super_admin' && employee.organization_id !== requester.organization_id) {
    throw new AppError('غير مصرح لك بالوصول إلى هذا الموظف', 403);
  }

  return employee;
}

/**
 * Create new employee
 */
export async function createEmployee(creatorId, employeeData, ipAddress) {
  const creator = await User.findByPk(creatorId);
  if (!creator) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const {
    employee_no,
    name,
    name_ar,
    email,
    phone,
    department,
    position,
    photo_url,
    hire_date,
    organization_id,
    notes,
    metadata,
    is_active = true
  } = employeeData;

  // Determine organization_id
  let targetOrgId = organization_id;
  
  // Non-super_admin users can only create employees in their own organization
  if (creator.role !== 'super_admin') {
    targetOrgId = creator.organization_id;
  }

  // If still no organization_id, use creator's organization
  if (!targetOrgId) {
    targetOrgId = creator.organization_id;
  }

  // Verify organization exists
  const organization = await Organization.findByPk(targetOrgId);
  if (!organization) {
    throw new AppError('المؤسسة غير موجودة', 404);
  }

  // Check organization limits
  const employeeCount = await Employee.count({ where: { organization_id: targetOrgId } });
  if (employeeCount >= organization.max_employees) {
    throw new AppError('تم الوصول للحد الأقصى لعدد الموظفين في هذه المؤسسة', 403);
  }

  // Check if employee_no already exists in this organization
  const existingEmployee = await Employee.findOne({
    where: {
      organization_id: targetOrgId,
      employee_no: employee_no
    }
  });

  if (existingEmployee) {
    throw new AppError('رقم الموظف موجود مسبقاً في هذه المؤسسة', 409);
  }

  // Create employee
  const newEmployee = await Employee.create({
    organization_id: targetOrgId,
    employee_no,
    name,
    name_ar,
    email,
    phone,
    department,
    position,
    photo_url,
    hire_date,
    notes,
    metadata: metadata || {},
    is_active
  });

  // Create audit log
  await AuditLog.create({
    user_id: creatorId,
    action: 'create',
    resource_type: 'Employee',
    resource_id: newEmployee.id,
    description: `تم إنشاء موظف جديد: ${name} (${employee_no})`,
    ip_address: ipAddress,
    new_values: {
      employee_no,
      name,
      name_ar,
      department,
      position,
      organization_id: targetOrgId
    }
  });

  // Fetch with organization data
  const employeeWithOrg = await Employee.findByPk(newEmployee.id, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      }
    ]
  });

  return employeeWithOrg;
}

/**
 * Update employee
 */
export async function updateEmployee(updaterId, employeeId, updateData, ipAddress) {
  const updater = await User.findByPk(updaterId);
  if (!updater) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetEmployee = await Employee.findByPk(employeeId);
  if (!targetEmployee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (updater.role !== 'super_admin' && targetEmployee.organization_id !== updater.organization_id) {
    throw new AppError('غير مصرح لك بتعديل هذا الموظف', 403);
  }

  // Store old values for audit
  const oldValues = {
    employee_no: targetEmployee.employee_no,
    name: targetEmployee.name,
    name_ar: targetEmployee.name_ar,
    email: targetEmployee.email,
    phone: targetEmployee.phone,
    department: targetEmployee.department,
    position: targetEmployee.position,
    is_active: targetEmployee.is_active
  };

  // Allowed fields to update
  const allowedFields = [
    'name',
    'name_ar',
    'email',
    'phone',
    'department',
    'position',
    'photo_url',
    'hire_date',
    'notes',
    'metadata',
    'is_active'
  ];

  // Build update object
  const updates = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  // Check if employee_no is being changed
  if (updateData.employee_no && updateData.employee_no !== targetEmployee.employee_no) {
    const existingEmployee = await Employee.findOne({
      where: {
        organization_id: targetEmployee.organization_id,
        employee_no: updateData.employee_no,
        id: { [Op.ne]: employeeId }
      }
    });
    if (existingEmployee) {
      throw new AppError('رقم الموظف موجود مسبقاً في هذه المؤسسة', 409);
    }
    updates.employee_no = updateData.employee_no;
  }

  // Update employee
  await targetEmployee.update(updates);

  // Create audit log
  await AuditLog.create({
    user_id: updaterId,
    action: 'update',
    resource_type: 'Employee',
    resource_id: employeeId,
    description: `تم تحديث بيانات الموظف: ${targetEmployee.name} (${targetEmployee.employee_no})`,
    ip_address: ipAddress,
    old_values: oldValues,
    new_values: updates
  });

  // Return updated employee with organization
  const updatedEmployee = await Employee.findByPk(employeeId, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'subscription_plan']
      }
    ]
  });

  return updatedEmployee;
}

/**
 * Delete employee (soft delete)
 */
export async function deleteEmployee(deleterId, employeeId, ipAddress) {
  const deleter = await User.findByPk(deleterId);
  if (!deleter) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const targetEmployee = await Employee.findByPk(employeeId);
  if (!targetEmployee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (deleter.role !== 'super_admin' && targetEmployee.organization_id !== deleter.organization_id) {
    throw new AppError('غير مصرح لك بحذف هذا الموظف', 403);
  }

  // Soft delete
  await targetEmployee.update({ is_active: false });

  // Create audit log
  await AuditLog.create({
    user_id: deleterId,
    action: 'delete',
    resource_type: 'Employee',
    resource_id: employeeId,
    description: `تم حذف الموظف: ${targetEmployee.name} (${targetEmployee.employee_no})`,
    ip_address: ipAddress,
    old_values: {
      is_active: true
    },
    new_values: {
      is_active: false
    }
  });

  return { message: 'تم حذف الموظف بنجاح' };
}

/**
 * Activate employee
 */
export async function activateEmployee(userId, employeeId, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (user.role !== 'super_admin' && employee.organization_id !== user.organization_id) {
    throw new AppError('غير مصرح لك بتفعيل هذا الموظف', 403);
  }

  if (employee.is_active) {
    throw new AppError('الموظف مفعّل بالفعل', 400);
  }

  await employee.update({ is_active: true });

  // Create audit log
  await AuditLog.create({
    user_id: userId,
    action: 'update',
    resource_type: 'Employee',
    resource_id: employeeId,
    description: `تم تفعيل الموظف: ${employee.name} (${employee.employee_no})`,
    ip_address: ipAddress,
    new_values: { is_active: true }
  });

  return employee;
}

/**
 * Deactivate employee
 */
export async function deactivateEmployee(userId, employeeId, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (user.role !== 'super_admin' && employee.organization_id !== user.organization_id) {
    throw new AppError('غير مصرح لك بتعطيل هذا الموظف', 403);
  }

  if (!employee.is_active) {
    throw new AppError('الموظف معطّل بالفعل', 400);
  }

  await employee.update({ is_active: false });

  // Create audit log
  await AuditLog.create({
    user_id: userId,
    action: 'update',
    resource_type: 'Employee',
    resource_id: employeeId,
    description: `تم تعطيل الموظف: ${employee.name} (${employee.employee_no})`,
    ip_address: ipAddress,
    new_values: { is_active: false }
  });

  return employee;
}

/**
 * Get employee biometric data
 */
export async function getEmployeeBiometrics(userId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Organization access check
  if (user.role !== 'super_admin' && employee.organization_id !== user.organization_id) {
    throw new AppError('غير مصرح لك بالوصول إلى بيانات هذا الموظف', 403);
  }

  const [faces, fingerprints, cards] = await Promise.all([
    FaceTemplate.findAll({
      where: { employee_id: employeeId },
      attributes: ['id', 'template_data', 'quality_score', 'created_at', 'updated_at']
    }),
    FingerprintTemplate.findAll({
      where: { employee_id: employeeId },
      attributes: ['id', 'finger_number', 'template_data', 'quality_score', 'created_at', 'updated_at']
    }),
    CardTemplate.findAll({
      where: { employee_id: employeeId },
      attributes: ['id', 'card_number', 'card_type', 'is_active', 'created_at', 'updated_at']
    })
  ]);

  return {
    employee_id: employeeId,
    employee_name: employee.name,
    biometrics: {
      faces,
      fingerprints,
      cards
    }
  };
}

/**
 * Get departments list for an organization
 */
export async function getDepartments(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {};
  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const departments = await Employee.findAll({
    where: {
      ...whereClause,
      department: { [Op.ne]: null }
    },
    attributes: [
      'department',
      [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'employee_count']
    ],
    group: ['department'],
    order: [['department', 'ASC']]
  });

  return departments;
}

/**
 * Get employee statistics
 */
export async function getEmployeeStats(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const whereClause = {};
  if (user.role !== 'super_admin') {
    whereClause.organization_id = user.organization_id;
  }

  const [totalEmployees, activeEmployees, inactiveEmployees, departments] = await Promise.all([
    Employee.count({ where: whereClause }),
    Employee.count({ where: { ...whereClause, is_active: true } }),
    Employee.count({ where: { ...whereClause, is_active: false } }),
    Employee.count({
      where: {
        ...whereClause,
        department: { [Op.ne]: null }
      },
      distinct: true,
      col: 'department'
    })
  ]);

  return {
    total: totalEmployees,
    active: activeEmployees,
    inactive: inactiveEmployees,
    departments_count: departments
  };
}

/**
 * Update employee photo
 */
export async function updateEmployeePhoto(userId, employeeId, photoUrl, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  // Check if user can update employee
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  // Authorization: super_admin or same organization admin/manager
  if (user.role !== 'super_admin') {
    if (user.organization_id !== employee.organization_id) {
      throw new AppError('غير مصرح - يمكنك فقط تعديل موظفي مؤسستك', 403);
    }
    if (!['admin', 'manager'].includes(user.role)) {
      throw new AppError('غير مصرح - صلاحيات غير كافية', 403);
    }
  }

  // If removing photo, delete old file
  if (!photoUrl && employee.photo_url) {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const oldPhotoPath = path.join(__dirname, '../..', employee.photo_url);
    
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath);
    }
  }

  // Update employee photo
  await employee.update({ photo_url: photoUrl });

  // Log the action
  await AuditLog.create({
    user_id: userId,
    organization_id: user.organization_id,
    action: photoUrl ? 'update' : 'delete',
    resource_type: 'employee',
    resource_id: employeeId,
    description: photoUrl ? `تحميل صورة للموظف ${employee.name}` : `حذف صورة الموظف ${employee.name}`,
    details: {
      employee_id: employee.id,
      employee_name: employee.name,
      photo_url: photoUrl
    },
    ip_address: ipAddress
  });

  return await getEmployeeById(userId, employeeId);
}
