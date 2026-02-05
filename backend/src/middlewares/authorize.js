/**
 * Authorization Middleware
 * التحقق من الصلاحيات (Roles & Permissions)
 */

import { AppError } from './errorHandler.js';

/**
 * التحقق من role المستخدم أو custom permissions
 * 
 * @param {Array} roles - مصفوفة من الأدوار المسموحة ['super_admin', 'admin']
 * @param {Array} permissions - مصفوفة من الصلاحيات المطلوبة ['users.create', 'users.edit']
 * @param {String} checkType - نوع الفحص: 'any' (أي صلاحية) أو 'all' (جميع الصلاحيات)
 * 
 * Usage:
 * router.delete('/users/:id', authenticate, authorize(['super_admin', 'admin']), deleteUser);
 * router.post('/users', authenticate, authorize([], ['users.create']), createUser);
 * router.put('/users/:id', authenticate, authorize(['admin'], ['users.edit'], 'any'), updateUser);
 */
const authorize = (roles = [], permissions = [], checkType = 'any') => {
  return (req, res, next) => {
    // التحقق من وجود مستخدم مسجل دخول
    if (!req.user) {
      throw new AppError('غير مصرح - يرجى تسجيل الدخول أولاً', 401);
    }

    const user = req.user;

    // super_admin له صلاحية كاملة
    if (user.role === 'super_admin' || user.custom_permissions?.includes('all')) {
      return next();
    }

    // التحقق من role
    let hasRole = false;
    if (roles.length > 0) {
      hasRole = roles.includes(user.role);
    }

    // التحقق من permissions
    let hasPermission = false;
    if (permissions.length > 0) {
      const userPermissions = user.custom_permissions || [];

      if (checkType === 'all') {
        // يجب أن تكون جميع الصلاحيات موجودة
        hasPermission = permissions.every(permission => 
          userPermissions.includes(permission)
        );
      } else {
        // يكفي أي صلاحية واحدة
        hasPermission = permissions.some(permission => 
          userPermissions.includes(permission)
        );
      }
    }

    // إذا لم يحدد roles ولا permissions، نرفض
    if (roles.length === 0 && permissions.length === 0) {
      throw new AppError('لم يتم تحديد صلاحيات مطلوبة', 500);
    }

    // التحقق النهائي
    if (checkType === 'all') {
      // يجب توفر الـ role والـ permissions معاً
      if ((roles.length === 0 || hasRole) && (permissions.length === 0 || hasPermission)) {
        return next();
      }
    } else {
      // يكفي أي منهما
      if (hasRole || hasPermission) {
        return next();
      }
    }

    // إذا لم يكن لديه الصلاحيات المطلوبة
    throw new AppError('ليس لديك صلاحية للوصول إلى هذا المورد', 403);
  };
};

/**
 * التحقق من أن المستخدم ينتمي لنفس المؤسسة
 * يستخدم لمنع المستخدمين من الوصول لبيانات مؤسسات أخرى
 * 
 * @param {Function} getOrganizationId - دالة لاستخراج organization_id من req
 * 
 * Usage:
 * router.get('/employees/:id', 
 *   authenticate, 
 *   checkOrganization(req => req.params.organization_id),
 *   getEmployee
 * );
 */
const checkOrganization = (getOrganizationId) => {
  return (req, res, next) => {
    // super_admin يستطيع الوصول لجميع المؤسسات
    if (req.user.role === 'super_admin') {
      return next();
    }

    const requestedOrgId = getOrganizationId(req);
    const userOrgId = req.user.organization_id;

    if (!requestedOrgId) {
      // إذا لم يحدد organization_id في الطلب، نستخدم organization المستخدم
      req.organizationId = userOrgId;
      return next();
    }

    // التحقق من التطابق
    if (parseInt(requestedOrgId) !== parseInt(userOrgId)) {
      throw new AppError('ليس لديك صلاحية للوصول إلى بيانات هذه المؤسسة', 403);
    }

    next();
  };
};

/**
 * التحقق من أن المستخدم هو نفسه
 * يستخدم للـ endpoints التي يمكن للمستخدم الوصول لها لنفسه فقط
 * 
 * Usage:
 * router.put('/users/:id/profile', authenticate, checkOwnership('params.id'), updateProfile);
 */
const checkOwnership = (userIdPath = 'params.id') => {
  return (req, res, next) => {
    // super_admin يستطيع الوصول لكل شيء
    if (req.user.role === 'super_admin') {
      return next();
    }

    // استخراج user_id من الطلب
    const pathParts = userIdPath.split('.');
    let requestedUserId = req;
    
    for (const part of pathParts) {
      requestedUserId = requestedUserId[part];
      if (!requestedUserId) break;
    }

    // التحقق من التطابق
    if (parseInt(requestedUserId) !== parseInt(req.user.id)) {
      throw new AppError('ليس لديك صلاحية لتعديل بيانات مستخدم آخر', 403);
    }

    next();
  };
};

export { authorize, checkOrganization, checkOwnership };
