// backend/src/routes/notificationRoutes.js
// Routes for Web Push Notifications

import express from 'express'
import notificationController from '../controllers/notificationController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/notifications/config
 * @desc    Get VAPID public key
 * @access  Private
 */
router.get('/config', notificationController.getConfig)

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/subscribe', notificationController.subscribe)

/**
 * @route   POST /api/notifications/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.post('/unsubscribe', notificationController.unsubscribe)

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification
 * @access  Private
 */
router.post('/test', notificationController.sendTest)

/**
 * @route   GET /api/notifications/subscriptions
 * @desc    Get user's active subscriptions
 * @access  Private
 */
router.get('/subscriptions', notificationController.getSubscriptions)

export default router
