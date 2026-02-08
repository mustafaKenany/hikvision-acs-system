// backend/src/services/pushNotificationService.js
// Service for sending Web Push Notifications

import webPush from 'web-push'
import PushSubscription from '../models/PushSubscription.js'
import logger from '../utils/logger.js'

// إعداد VAPID keys
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@hikvision-acs.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

class PushNotificationService {
  
  /**
   * إرسال إشعار لمستخدم واحد
   */
  async sendToUser(userId, payload) {
    try {
      // جلب جميع اشتراكات المستخدم النشطة
      const subscriptions = await PushSubscription.findAll({
        where: {
          user_id: userId,
          is_active: true
        }
      })

      if (subscriptions.length === 0) {
        logger.info(`No active subscriptions for user ${userId}`)
        return { success: true, sent: 0 }
      }

      // إرسال للجميع
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      )

      const sentCount = results.filter(r => r.status === 'fulfilled').length
      
      logger.info(`Sent ${sentCount}/${subscriptions.length} notifications to user ${userId}`)
      
      return { success: true, sent: sentCount, total: subscriptions.length }
    } catch (error) {
      logger.error('Error sending notification to user:', error)
      throw error
    }
  }

  /**
   * إرسال إشعار لعدة مستخدمين
   */
  async sendToUsers(userIds, payload) {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => this.sendToUser(userId, payload))
      )

      const totalSent = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => sum + r.value.sent, 0)

      logger.info(`Sent ${totalSent} notifications to ${userIds.length} users`)
      
      return { success: true, sent: totalSent, users: userIds.length }
    } catch (error) {
      logger.error('Error sending notifications to users:', error)
      throw error
    }
  }

  /**
   * إرسال إشعار لجميع المشتركين
   */
  async sendToAll(payload) {
    try {
      const subscriptions = await PushSubscription.findAll({
        where: { is_active: true }
      })

      if (subscriptions.length === 0) {
        logger.info('No active subscriptions')
        return { success: true, sent: 0 }
      }

      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, payload))
      )

      const sentCount = results.filter(r => r.status === 'fulfilled').length
      
      logger.info(`Sent ${sentCount}/${subscriptions.length} broadcast notifications`)
      
      return { success: true, sent: sentCount, total: subscriptions.length }
    } catch (error) {
      logger.error('Error sending broadcast notification:', error)
      throw error
    }
  }

  /**
   * إرسال إشعار لاشتراك واحد
   */
  async sendNotification(subscription, payload) {
    try {
      const pushConfig = {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      }

      const notificationPayload = JSON.stringify({
        title: payload.title || 'Hikvision ACS',
        body: payload.body || 'لديك إشعار جديد',
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        image: payload.image,
        data: payload.data || {},
        tag: payload.tag || 'notification',
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions || [],
        url: payload.url || '/'
      })

      await webPush.sendNotification(pushConfig, notificationPayload)

      // تحديث last_used
      await subscription.update({ last_used: new Date() })

      logger.debug(`Notification sent to subscription ${subscription.id}`)
      
      return { success: true }
    } catch (error) {
      // إذا كان الاشتراك غير صالح، إلغاء تفعيله
      if (error.statusCode === 410 || error.statusCode === 404) {
        logger.warn(`Invalid subscription ${subscription.id}, deactivating`)
        await subscription.update({ is_active: false })
      } else {
        logger.error(`Error sending to subscription ${subscription.id}:`, error)
      }
      throw error
    }
  }

  /**
   * إشعارات خاصة بالموظفين
   */
  async notifyEmployeeCreated(employee, adminIds) {
    const payload = {
      title: '✅ موظف جديد',
      body: `تمت إضافة ${employee.name} (${employee.employee_no})`,
      icon: employee.photo_url || '/favicon.ico',
      tag: `employee-created-${employee.id}`,
      url: `/employees/${employee.id}`,
      data: {
        type: 'employee_created',
        employeeId: employee.id
      }
    }

    return this.sendToUsers(adminIds, payload)
  }

  async notifyEmployeeUpdated(employee, adminIds) {
    const payload = {
      title: '📝 تحديث موظف',
      body: `تم تحديث بيانات ${employee.name}`,
      icon: employee.photo_url || '/favicon.ico',
      tag: `employee-updated-${employee.id}`,
      url: `/employees/${employee.id}`,
      data: {
        type: 'employee_updated',
        employeeId: employee.id
      }
    }

    return this.sendToUsers(adminIds, payload)
  }

  async notifyEmployeeDeleted(employeeName, adminIds) {
    const payload = {
      title: '🗑️ حذف موظف',
      body: `تم حذف ${employeeName}`,
      tag: 'employee-deleted',
      url: '/employees',
      data: {
        type: 'employee_deleted'
      }
    }

    return this.sendToUsers(adminIds, payload)
  }

  async notifyAttendance(employee, type, adminIds) {
    const payload = {
      title: type === 'in' ? '✅ حضور' : '🚪 انصراف',
      body: `${employee.name} ${type === 'in' ? 'حضر' : 'انصرف'} الساعة ${new Date().toLocaleTimeString('ar-SA')}`,
      icon: employee.photo_url || '/favicon.ico',
      tag: `attendance-${employee.id}-${Date.now()}`,
      url: `/access-logs`,
      data: {
        type: 'attendance',
        employeeId: employee.id,
        attendanceType: type
      }
    }

    return this.sendToUsers(adminIds, payload)
  }
}

export default new PushNotificationService()
