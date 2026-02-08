# 📢 دليل إشعارات النظام

## 📱 أنواع الإشعارات

---

## 1️⃣ Snackbar Notifications (موجودة حالياً) ✅

### **الوصف:**
رسائل صغيرة تظهر أسفل الشاشة داخل التطبيق لمدة 3 ثوانٍ

### **الاستخدام الحالي:**
- ✅ تمت إضافة الموظف بنجاح
- ✅ تم تحديث الموظف بنجاح  
- ✅ تم حذف الموظف بنجاح
- ❌ حدث خطأ أثناء العملية

### **الموقع:**
- داخل المتصفح فقط
- لا تصل للهاتف
- تختفي تلقائياً بعد 3 ثوانٍ

### **الكود:**
```vue
<!-- في Employees.vue -->
<v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
  {{ snackbarText }}
  <template #actions>
    <v-btn color="white" variant="text" @click="snackbar = false">
      إغلاق
    </v-btn>
  </template>
</v-snackbar>

<!-- استخدام -->
<script setup>
const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// مثال
showSnackbar('تمت إضافة الموظف بنجاح', 'success')
showSnackbar('حدث خطأ', 'error')
</script>
```

---

## 2️⃣ Web Push Notifications (مستقبلاً) 🔔

### **الوصف:**
إشعارات تظهر على سطح المكتب أو الجوال حتى لو المتصفح مغلق

### **حالات الاستخدام:**
📌 **للمدير:**
- موظف حضر/انصرف
- موظف متأخر
- جهاز غير متصل
- تقرير يومي جاهز

📌 **للموظف:**
- تم الموافقة على إجازتك
- لديك رسالة جديدة
- تحديث في جدول الدوام

### **كيف تعمل؟**

```
[حدث] → [Backend] → [Web Push Service] → [إشعار]
                          ↓
              ┌──────────────────────┐
              │ 🔔 Hikvision ACS     │
              │ علي أحمد حضر الساعة  │
              │ 8:00 ص               │
              └──────────────────────┘
```

### **المتطلبات التقنية:**

#### 1. Service Worker (ملف: `public/service-worker.js`)
```javascript
// التسجيل للإشعارات
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

#### 2. طلب الإذن (في التطبيق)
```javascript
// src/composables/useNotifications.js
export function useNotifications() {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('المتصفح لا يدعم الإشعارات')
      return false
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // التسجيل للإشعارات
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_PUBLIC_KEY'
      })
      
      // إرسال subscription للباك إند
      await axios.post('/api/notifications/subscribe', {
        subscription: subscription.toJSON()
      })
      
      return true
    }
    
    return false
  }

  return { requestPermission }
}
```

#### 3. Backend API (Node.js)
```javascript
// backend/src/services/pushNotification.js
const webpush = require('web-push')

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

async function sendNotification(userId, payload) {
  // جلب subscription من قاعدة البيانات
  const subscription = await getUserSubscription(userId)
  
  const notificationPayload = {
    title: payload.title,
    body: payload.body,
    icon: '/logo.png',
    url: payload.url || '/'
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(notificationPayload)
    )
    console.log('✅ Notification sent successfully')
  } catch (error) {
    console.error('❌ Error sending notification:', error)
  }
}

module.exports = { sendNotification }
```

#### 4. Integration مع Access Logs
```javascript
// backend/src/controllers/accessLogController.js
const { sendNotification } = require('../services/pushNotification')

// عند تسجيل دخول/خروج
async function handleAccessEvent(employeeId, type) {
  const employee = await Employee.findByPk(employeeId)
  
  // حفظ السجل
  await AccessLog.create({...})
  
  // إرسال إشعار للمدير
  const managerId = employee.manager_id
  if (managerId) {
    await sendNotification(managerId, {
      title: 'حضور موظف',
      body: `${employee.name} ${type === 'in' ? 'حضر' : 'انصرف'} الساعة ${new Date().toLocaleTimeString('ar-SA')}`,
      url: `/employees/${employeeId}`
    })
  }
}
```

---

## 3️⃣ Firebase Cloud Messaging (للجوال) 📲

### **الوصف:**
إشعارات احترافية للتطبيقات على Android و iOS

### **المميزات:**
- ✅ موثوقية عالية (من Google)
- ✅ دعم كامل لـ Android + iOS
- ✅ إحصائيات مفصلة
- ✅ Targeting (إرسال لمجموعة معينة)
- ✅ Scheduling (جدولة الإشعارات)

### **Setup:**

#### 1. Firebase Console
```
1. انتقل إلى https://console.firebase.google.com
2. أنشئ مشروع جديد
3. أضف تطبيق Web/Android/iOS
4. احصل على Config & Server Key
```

#### 2. Frontend Integration
```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

// الحصول على Token
export async function requestNotificationPermission() {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    })
    
    if (token) {
      // إرسال Token للباك إند
      await axios.post('/api/fcm/register', { token })
      return token
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
  }
}

// استقبال الإشعارات (عندما التطبيق مفتوح)
onMessage(messaging, (payload) => {
  console.log('Message received:', payload)
  
  // عرض الإشعار
  new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon
  })
})
```

#### 3. Backend Integration
```javascript
// backend/src/services/fcm.js
const admin = require('firebase-admin')

// تهيئة Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
})

async function sendFCMNotification(tokens, payload) {
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.image
    },
    data: payload.data || {},
    tokens: tokens // يمكن إرسال لعدة أجهزة
  }

  try {
    const response = await admin.messaging().sendMulticast(message)
    console.log(`✅ Sent ${response.successCount} notifications`)
    return response
  } catch (error) {
    console.error('❌ Error sending FCM:', error)
    throw error
  }
}

module.exports = { sendFCMNotification }
```

---

## 4️⃣ Telegram Bot Notifications 📨

### **الوصف:**
إرسال إشعارات عبر تليجرام - سريع ومجاني

### **المميزات:**
- ✅ مجاني 100%
- ✅ سهل جداً
- ✅ يدعم الأزرار والصور
- ✅ سرعة توصيل عالية

### **Setup:**

#### 1. إنشاء Bot
```
1. افتح Telegram
2. ابحث عن @BotFather
3. أرسل /newbot
4. اتبع التعليمات
5. احصل على Bot Token
```

#### 2. Backend Implementation
```javascript
// backend/src/services/telegram.js
const axios = require('axios')

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function sendTelegramMessage(chatId, message, options = {}) {
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      ...options
    })
    return response.data
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    throw error
  }
}

// مع أزرار تفاعلية
async function sendAccessAlert(managerId, employee, type) {
  const message = `
🔔 <b>إشعار حضور جديد</b>

👤 الموظف: <b>${employee.name}</b>
📋 رقم الموظف: ${employee.employee_no}
⏰ الوقت: ${new Date().toLocaleTimeString('ar-SA')}
📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}
✅ الحالة: ${type === 'in' ? 'حضور' : 'انصراف'}
  `

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📊 عرض التفاصيل', url: `https://your-domain.com/employees/${employee.id}` },
        { text: '📈 التقرير اليومي', callback_data: 'daily_report' }
      ]
    ]
  }

  await sendTelegramMessage(managerId, message, {
    reply_markup: keyboard
  })
}

module.exports = { sendTelegramMessage, sendAccessAlert }
```

#### 3. ربط المستخدمين
```javascript
// Users Table - أضف حقل telegram_chat_id
// عندما المستخدم يبدأ محادثة مع البوت:

// Backend webhook endpoint
app.post('/telegram/webhook', async (req, res) => {
  const { message } = req.body
  
  if (message.text === '/start') {
    const chatId = message.chat.id
    const userId = message.from.id
    
    // ربط chat_id بحساب المستخدم
    await User.update(
      { telegram_chat_id: chatId },
      { where: { telegram_user_id: userId } }
    )
    
    await sendTelegramMessage(chatId, 
      '✅ تم ربط حسابك بنجاح!\n\nستصلك الإشعارات هنا.'
    )
  }
  
  res.sendStatus(200)
})
```

---

## 5️⃣ WhatsApp Business API (مدفوع) 💬

### **الوصف:**
إرسال رسائل عبر واتساب - احترافي لكن مدفوع

### **التكلفة:**
- ~$0.005 لكل رسالة (تقريباً)
- يعتمد على الدولة

### **الخدمات:**
- [Twilio](https://www.twilio.com/whatsapp)
- [MessageBird](https://www.messagebird.com)
- [Meta Business API](https://business.whatsapp.com)

### **مثال (Twilio):**
```javascript
const twilio = require('twilio')
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

async function sendWhatsAppAlert(phoneNumber, employee, type) {
  const message = `
🔔 *Hikvision ACS*

✅ ${employee.name} ${type === 'in' ? 'حضر' : 'انصرف'}
⏰ الساعة: ${new Date().toLocaleTimeString('ar-SA')}

عرض التفاصيل: https://your-app.com/employees/${employee.id}
  `

  await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox
    to: `whatsapp:${phoneNumber}`,
    body: message
  })
}
```

---

## 📊 مقارنة الخيارات

| الميزة | Snackbar | Web Push | FCM | Telegram | WhatsApp |
|--------|----------|----------|-----|----------|----------|
| **التكلفة** | مجاني | مجاني | مجاني | مجاني | مدفوع |
| **سهولة التنفيذ** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **يصل للجوال** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **يعمل والتطبيق مغلق** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **الموثوقية** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **الاستخدام الحالي** | ✅ موجود | 🔜 قريباً | 🔜 متقدم | 🔜 بديل | 🔜 احترافي |

---

## 🎯 التوصية للمشروع

### **المرحلة 1 (الآن):** ✅
```
✅ Snackbar Notifications
   - موجودة ومكتملة
   - كافية للتطبيق الداخلي
```

### **المرحلة 2 (قريباً):** 🔜
```
🔔 Web Push Notifications
   ✅ مجانية
   ✅ سهلة التنفيذ
   ✅ تعمل على المتصفح
   ✅ تصل للمدراء على الكمبيوتر
```

### **المرحلة 3 (بديل سريع):** 🔜
```
📨 Telegram Bot
   ✅ مجاني 100%
   ✅ سريع جداً للتنفيذ
   ✅ يعمل على كل الأجهزة
   ✅ يدعم الأزرار التفاعلية
```

### **المرحلة 4 (احترافي):** 🔜
```
📲 Firebase Cloud Messaging
   ✅ للتطبيق على الجوال
   ✅ إشعارات احترافية
   ✅ إحصائيات وتقارير
```

---

## 📝 ملاحظات مهمة

### **الأمان:**
- ⚠️ لا ترسل بيانات حساسة في الإشعارات
- ⚠️ استخدم HTTPS دائماً
- ⚠️ خزّن Tokens بشكل آمن

### **الخصوصية:**
- 📋 اطلب إذن المستخدم قبل الإرسال
- 📋 وفر خيار إيقاف الإشعارات
- 📋 احترم تفضيلات المستخدم

### **الأداء:**
- ⚡ لا ترسل إشعارات كثيرة
- ⚡ اجمع الإشعارات المتشابهة
- ⚡ استخدم Queue للإرسال الجماعي

---

## 🚀 الخطوات التالية (عند الجاهزية)

1. ✅ اختبار Snackbar الحالية
2. 🔜 تطبيق Web Push (أسبوع واحد)
3. 🔜 تطبيق Telegram Bot (يومين)
4. 🔜 دراسة FCM للمستقبل

---

**❓ هل تريد البدء بأي منها الآن؟**
