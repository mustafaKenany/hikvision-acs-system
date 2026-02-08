// src/composables/useNotifications.js
// Composable لإدارة Web Push Notifications

import { ref, computed } from 'vue'
import axios from '@/api/axios'

const isSupported = computed(() => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
})

const permission = ref(Notification.permission)
const subscription = ref(null)
const isSubscribed = ref(false)

export function useNotifications() {
  
  // طلب الإذن من المستخدم
  const requestPermission = async () => {
    if (!isSupported.value) {
      throw new Error('المتصفح لا يدعم الإشعارات')
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      
      if (result === 'granted') {
        console.log('✅ تم منح إذن الإشعارات')
        return true
      } else if (result === 'denied') {
        console.warn('❌ تم رفض إذن الإشعارات')
        return false
      } else {
        console.log('⏸️ تم تجاهل إذن الإشعارات')
        return false
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error)
      throw error
    }
  }

  // تسجيل Service Worker
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker غير مدعوم')
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })
      
      console.log('✅ Service Worker registered:', registration.scope)
      
      // انتظار حتى يصبح نشطاً
      await navigator.serviceWorker.ready
      
      return registration
    } catch (error) {
      console.error('❌ فشل تسجيل Service Worker:', error)
      throw error
    }
  }

  // الاشتراك في الإشعارات
  const subscribe = async () => {
    try {
      // 1. طلب الإذن
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        return { success: false, message: 'لم يتم منح الإذن' }
      }

      // 2. تسجيل Service Worker
      const registration = await registerServiceWorker()

      // 3. الحصول على VAPID Public Key من السيرفر
      const { data: configData } = await axios.get('/api/notifications/config')
      const publicKey = configData.data.publicKey

      // 4. تحويل Public Key إلى Uint8Array
      const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/')
        
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
      }

      // 5. إنشاء الاشتراك
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      console.log('✅ Push subscription created:', pushSubscription)

      // 6. إرسال الاشتراك إلى السيرفر
      const { data: subscribeData } = await axios.post('/api/notifications/subscribe', {
        subscription: pushSubscription.toJSON()
      })

      subscription.value = pushSubscription
      isSubscribed.value = true

      return { success: true, message: 'تم تفعيل الإشعارات بنجاح' }
    } catch (error) {
      console.error('❌ خطأ في الاشتراك:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'حدث خطأ أثناء تفعيل الإشعارات' 
      }
    }
  }

  // إلغاء الاشتراك
  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()

      if (!pushSubscription) {
        console.log('⚠️ لا يوجد اشتراك نشط')
        return { success: false, message: 'لا يوجد اشتراك نشط' }
      }

      // إلغاء الاشتراك من المتصفح
      await pushSubscription.unsubscribe()

      // إلغاء الاشتراك من السيرفر
      await axios.post('/api/notifications/unsubscribe', {
        endpoint: pushSubscription.endpoint
      })

      subscription.value = null
      isSubscribed.value = false

      console.log('✅ تم إلغاء الاشتراك بنجاح')
      return { success: true, message: 'تم إلغاء الإشعارات بنجاح' }
    } catch (error) {
      console.error('❌ خطأ في إلغاء الاشتراك:', error)
      return { 
        success: false, 
        message: 'حدث خطأ أثناء إلغاء الإشعارات' 
      }
    }
  }

  // التحقق من حالة الاشتراك
  const checkSubscription = async () => {
    try {
      if (!isSupported.value) {
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()

      if (pushSubscription) {
        subscription.value = pushSubscription
        isSubscribed.value = true
        console.log('✅ يوجد اشتراك نشط')
        return true
      } else {
        isSubscribed.value = false
        console.log('⚠️ لا يوجد اشتراك نشط')
        return false
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق من الاشتراك:', error)
      return false
    }
  }

  // إرسال إشعار تجريبي
  const sendTestNotification = async () => {
    try {
      const { data } = await axios.post('/api/notifications/test')
      return { success: true, message: 'تم إرسال إشعار تجريبي' }
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار التجريبي:', error)
      return { 
        success: false, 
        message: 'فشل إرسال الإشعار التجريبي' 
      }
    }
  }

  return {
    // State
    isSupported,
    permission,
    isSubscribed,
    subscription,

    // Methods
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription,
    sendTestNotification
  }
}
