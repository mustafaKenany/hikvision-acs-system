// backend/src/controllers/notificationController.js
// Controller for Web Push Notifications

import PushSubscription from '../models/PushSubscription.js'
import pushNotificationService from '../services/pushNotificationService.js'
import logger from '../utils/logger.js'

class NotificationController {
  
  /**
   * GET /api/notifications/config
   * Get VAPID public key for frontend
   */
  async getConfig(req, res) {
    try {
      res.json({
        success: true,
        data: {
          publicKey: process.env.VAPID_PUBLIC_KEY
        }
      })
    } catch (error) {
      logger.error('Error getting notification config:', error)
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إعدادات الإشعارات'
      })
    }
  }

  /**
   * POST /api/notifications/subscribe
   * Subscribe to push notifications
   */
  async subscribe(req, res) {
    try {
      const { subscription } = req.body
      const userId = req.user.id

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({
          success: false,
          message: 'بيانات الاشتراك غير صحيحة'
        })
      }

      // Check if subscription already exists
      let pushSub = await PushSubscription.findOne({
        where: { endpoint: subscription.endpoint }
      })

      if (pushSub) {
        // Update existing subscription
        await pushSub.update({
          user_id: userId,
          keys: subscription.keys,
          user_agent: req.headers['user-agent'],
          is_active: true
        })

        logger.info(`Updated push subscription for user ${userId}`)
      } else {
        // Create new subscription
        pushSub = await PushSubscription.create({
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          user_agent: req.headers['user-agent'],
          is_active: true
        })

        logger.info(`Created push subscription for user ${userId}`)
      }

      res.json({
        success: true,
        message: 'تم تفعيل الإشعارات بنجاح',
        data: {
          id: pushSub.id
        }
      })
    } catch (error) {
      logger.error('Error subscribing to notifications:', error)
      res.status(500).json({
        success: false,
        message: 'خطأ في تفعيل الإشعارات'
      })
    }
  }

  /**
   * POST /api/notifications/unsubscribe
   * Unsubscribe from push notifications
   */
  async unsubscribe(req, res) {
    try {
      const { endpoint } = req.body
      const userId = req.user.id

      if (!endpoint) {
        return res.status(400).json({
          success: false,
          message: 'بيانات الإلغاء غير صحيحة'
        })
      }

      const subscription = await PushSubscription.findOne({
        where: {
          endpoint,
          user_id: userId
        }
      })

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'الاشتراك غير موجود'
        })
      }

      await subscription.destroy()

      logger.info(`Unsubscribed user ${userId} from push notifications`)

      res.json({
        success: true,
        message: 'تم إلغاء الإشعارات بنجاح'
      })
    } catch (error) {
      logger.error('Error unsubscribing from notifications:', error)
      res.status(500).json({
        success: false,
        message: 'خطأ في إلغاء الإشعارات'
      })
    }
  }

  /**
   * POST /api/notifications/test
   * Send test notification to current user
   */
  async sendTest(req, res) {
    try {
      const userId = req.user.id

      const payload = {
        title: '🔔 إشعار تجريبي',
        body: 'هذا إشعار تجريبي من نظام Hikvision ACS',
        icon: '/favicon.ico',
        tag: 'test-notification',
        url: '/settings',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      }

      const result = await pushNotificationService.sendToUser(userId, payload)

      if (result.sent > 0) {
        res.json({
          success: true,
          message: 'تم إرسال الإشعار التجريبي بنجاح',
          data: result
        })
      } else {
        res.status(404).json({
          success: false,
          message: 'لا توجد اشتراكات نشطة'
        })
      }
    } catch (error) {
      logger.error('Error sending test notification:', error)
      res.status(500).json({
        success: false,
        message: 'خطأ في إرسال الإشعار التجريبي'
      })
    }
  }

  /**
   * GET /api/notifications/subscriptions
   * Get user's active subscriptions
   */
  async getSubscriptions(req, res) {
    try {
      const userId = req.user.id

      const subscriptions = await PushSubscription.findAll({
        where: {
          user_id: userId,
          is_active: true
        },
        attributes: ['id', 'user_agent', 'last_used', 'created_at'],
        order: [['created_at', 'DESC']]
      })

      res.json({
        success: true,
        data: subscriptions
      })
    } catch (error) {
      logger.error('Error getting subscriptions:', error)
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الاشتراكات'
      })
    }
  }
}

export default new NotificationController()
