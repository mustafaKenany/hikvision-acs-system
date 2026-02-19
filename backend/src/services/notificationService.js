/**
 * Notification Service
 * خدمة إدارة الإشعارات وإرسالها للمستخدمين
 */

import { Notification, User } from '../models/index.js';
import logger from '../utils/logger.js';
import redis from '../config/redis.js';

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ATTENDANCE: 'attendance',
  DEVICE: 'device',
  SYSTEM: 'system'
};

/**
 * Notification Priority
 */
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

class NotificationService {
  /**
   * Create notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification({
    user_id,
    title,
    message,
    type = NOTIFICATION_TYPES.INFO,
    priority = NOTIFICATION_PRIORITY.MEDIUM,
    data = null,
    action_url = null,
    expires_at = null
  }) {
    try {
      const notification = await Notification.create({
        user_id,
        title,
        message,
        type,
        priority,
        data,
        action_url,
        expires_at,
        is_read: false
      });

      // Cache notification for quick access
      await this.cacheUserNotifications(user_id);

      // Emit Socket.IO event if connected
      // this.emitToUser(user_id, 'new_notification', notification);

      logger.info(`Notification created for user ${user_id}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {Object} notificationData - Notification data
   */
  async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        ...notificationData,
        is_read: false
      }));

      const created = await Notification.bulkCreate(notifications);

      // Clear cache for all affected users
      for (const userId of userIds) {
        await this.cacheUserNotifications(userId);
      }

      logger.info(`Bulk notifications created for ${userIds.length} users`);
      return created;
    } catch (error) {
      logger.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   * @param {number} userId 
   * @param {Object} filters
   */
  async getUserNotifications(userId, {
    is_read = null,
    type = null,
    priority = null,
    limit = 50,
    offset = 0
  } = {}) {
    try {
      const where = { user_id: userId };

      if (is_read !== null) where.is_read = is_read;
      if (type) where.type = type;
      if (priority) where.priority = priority;

      // Check if still valid (not expired)
      where.expires_at = { [Op.or]: [null, { [Op.gt]: new Date() }] };

      const notifications = await Notification.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return notifications;
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   * @param {number} userId 
   */
  async getUnreadCount(userId) {
    try {
      // Try from cache first
      const cacheKey = `notifications:unread:${userId}`;
      
      if (redis && redis.status === 'ready') {
        const cached = await redis.get(cacheKey);
        if (cached) return parseInt(cached);
      }

      const count = await Notification.count({
        where: {
          user_id: userId,
          is_read: false,
          expires_at: { [Op.or]: [null, { [Op.gt]: new Date() }] }
        }
      });

      // Cache count
      if (redis && redis.status === 'ready') {
        await redis.setex(cacheKey, 60, count.toString());
      }

      return count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId 
   * @param {number} userId 
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({ is_read: true, read_at: new Date() });

      // Clear cache
      await this.clearUserNotificationCache(userId);

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all as read
   * @param {number} userId 
   */
  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            user_id: userId,
            is_read: false
          }
        }
      );

      // Clear cache
      await this.clearUserNotificationCache(userId);

      logger.info(`All notifications marked as read for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {number} notificationId 
   * @param {number} userId 
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.destroy({
        where: {
          id: notificationId,
          user_id: userId
        }
      });

      if (result === 0) {
        throw new Error('Notification not found');
      }

      // Clear cache
      await this.clearUserNotificationCache(userId);

      return true;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Cache user notifications
   * @param {number} userId 
   */
  async cacheUserNotifications(userId) {
    try {
      if (!redis || redis.status !== 'ready') return;

      const cacheKey = `notifications:user:${userId}`;
      const notifications = await this.getUserNotifications(userId, { limit: 20 });
      
      await redis.setex(cacheKey, 300, JSON.stringify(notifications)); // 5 minutes
    } catch (error) {
      logger.error('Error caching notifications:', error);
    }
  }

  /**
   * Clear user notification cache
   * @param {number} userId 
   */
  async clearUserNotificationCache(userId) {
    try {
      if (!redis || redis.status !== 'ready') return;

      const keys = await redis.keys(`notifications:*:${userId}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Error clearing notification cache:', error);
    }
  }

  /**
   * Clean expired notifications (run by cron)
   */
  async cleanExpiredNotifications() {
    try {
      const result = await Notification.destroy({
        where: {
          expires_at: {
            [Op.lt]: new Date()
          }
        }
      });

      logger.info(`Cleaned ${result} expired notifications`);
      return result;
    } catch (error) {
      logger.error('Error cleaning expired notifications:', error);
      throw error;
    }
  }

  /**
   * Send late arrival notification
   * @param {Object} employee 
   * @param {number} lateMinutes 
   */
  async sendLateArrivalNotification(employee, lateMinutes) {
    const managers = await User.findAll({
      where: {
        organization_id: employee.organization_id,
        role: ['admin', 'manager']
      }
    });

    const managerIds = managers.map(m => m.id);

    await this.createBulkNotifications(managerIds, {
      title: 'تأخير موظف',
      message: `الموظف ${employee.full_name} تأخر ${lateMinutes} دقيقة`,
      type: NOTIFICATION_TYPES.WARNING,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      data: {
        employee_id: employee.id,
        late_minutes: lateMinutes,
        date: new Date().toISOString()
      },
      action_url: `/attendance-reports?employee_id=${employee.id}`
    });
  }

  /**
   * Send absence notification
   * @param {Object} employee 
   * @param {Date} date 
   */
  async sendAbsenceNotification(employee, date) {
    const managers = await User.findAll({
      where: {
        organization_id: employee.organization_id,
        role: ['admin', 'manager']
      }
    });

    const managerIds = managers.map(m => m.id);

    await this.createBulkNotifications(managerIds, {
      title: 'غياب موظف',
      message: `الموظف ${employee.full_name} غائب اليوم`,
      type: NOTIFICATION_TYPES.ERROR,
      priority: NOTIFICATION_PRIORITY.HIGH,
      data: {
        employee_id: employee.id,
        date: date.toISOString()
      },
      action_url: `/attendance-reports?employee_id=${employee.id}`
    });
  }

  /**
   * Send device offline notification
   * @param {Object} device 
   */
  async sendDeviceOfflineNotification(device) {
    const admins = await User.findAll({
      where: {
        organization_id: device.organization_id,
        role: ['super_admin', 'admin']
      }
    });

    const adminIds = admins.map(a => a.id);

    await this.createBulkNotifications(adminIds, {
      title: 'جهاز غير متصل',
      message: `الجهاز ${device.name} (${device.ip_address}) غير متصل`,
      type: NOTIFICATION_TYPES.ERROR,
      priority: NOTIFICATION_PRIORITY.URGENT,
      data: {
        device_id: device.id,
        ip_address: device.ip_address
      },
      action_url: `/devices/${device.id}`
    });
  }
}

export default new NotificationService();
