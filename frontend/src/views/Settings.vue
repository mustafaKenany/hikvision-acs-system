<template>
  <div>
    <h1 class="text-h4 mb-6">الإعدادات</h1>

    <!-- Notifications Settings -->
    <v-card class="mb-4">
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-bell</v-icon>
        إشعارات المتصفح
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Support Check -->
        <v-alert
          v-if="!notifications.isSupported.value"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          <strong>غير مدعوم</strong>
          <br />
          المتصفح الحالي لا يدعم إشعارات المتصفح. استخدم Chrome أو Firefox أو Edge.
        </v-alert>

        <!-- Permission Denied -->
        <v-alert
          v-else-if="notifications.permission.value === 'denied'"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <strong>تم رفض الإذن</strong>
          <br />
          لتفعيل الإشعارات، يجب السماح بها من إعدادات المتصفح.
        </v-alert>

        <!-- Main Toggle -->
        <div v-else>
          <v-switch
            v-model="notificationsEnabled"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @change="toggleNotifications"
          >
            <template #label>
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  تفعيل الإشعارات
                </div>
                <div class="text-caption text-medium-emphasis">
                  استلام إشعارات فورية عند حدوث تحديثات
                </div>
              </div>
            </template>
          </v-switch>

          <!-- Success State -->
          <v-alert
            v-if="notificationsEnabled"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            <div class="d-flex align-center">
              <v-icon start>mdi-check-circle</v-icon>
              <div class="flex-grow-1">
                <strong>الإشعارات مفعّلة</strong>
                <br />
                <span class="text-caption">
                  ستصلك إشعارات عن العمليات التالية:
                </span>
              </div>
            </div>

            <v-list density="compact" class="mt-2 bg-transparent">
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon size="small" color="success">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-caption">إضافة/تعديل/حذف موظفين</v-list-item-title>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon size="small" color="success">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-caption">حضور وانصراف الموظفين</v-list-item-title>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon size="small" color="success">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-caption">تحديثات الأجهزة</v-list-item-title>
              </v-list-item>
              <v-list-item density="compact">
                <template #prepend>
                  <v-icon size="small" color="success">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-caption">التقارير اليومية</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              class="mt-2"
              @click="testNotification"
              :loading="testingNotification"
            >
              <v-icon start>mdi-send</v-icon>
              إرسال إشعار تجريبي
            </v-btn>
          </v-alert>

          <!-- Info -->
          <v-alert
            v-else
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <v-icon start>mdi-information</v-icon>
            قم بتفعيل الإشعارات لاستلام تحديثات فورية عن العمليات المهمة
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- Profile Settings (قيد التطوير) -->
    <v-card>
      <v-card-title class="bg-secondary text-white">
        <v-icon start>mdi-account</v-icon>
        الملف الشخصي
      </v-card-title>

      <v-card-text class="text-center py-12">
        <v-icon size="64" color="grey">mdi-account-cog</v-icon>
        <p class="text-h6 mt-4">قيد التطوير...</p>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          إغلاق
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const notifications = useNotifications()
const notificationsEnabled = ref(false)
const loading = ref(false)
const testingNotification = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Toggle notifications
const toggleNotifications = async () => {
  loading.value = true

  try {
    if (notificationsEnabled.value) {
      // تفعيل الإشعارات
      const result = await notifications.subscribe()
      
      if (result.success) {
        showSnackbar('✅ تم تفعيل الإشعارات بنجاح', 'success')
      } else {
        notificationsEnabled.value = false
        showSnackbar('❌ ' + result.message, 'error')
      }
    } else {
      // إلغاء الإشعارات
      const result = await notifications.unsubscribe()
      
      if (result.success) {
        showSnackbar('✅ تم إلغاء الإشعارات', 'info')
      } else {
        showSnackbar('❌ ' + result.message, 'error')
      }
    }
  } catch (error) {
    console.error('Error toggling notifications:', error)
    notificationsEnabled.value = !notificationsEnabled.value
    showSnackbar('❌ حدث خطأ غير متوقع', 'error')
  } finally {
    loading.value = false
  }
}

// Test notification
const testNotification = async () => {
  testingNotification.value = true

  try {
    const result = await notifications.sendTestNotification()
    
    if (result.success) {
      showSnackbar('✅ تم إرسال الإشعار التجريبي - تحقق من شاشتك!', 'success')
    } else {
      showSnackbar('❌ ' + result.message, 'error')
    }
  } catch (error) {
    console.error('Error sending test notification:', error)
    showSnackbar('❌ حدث خطأ في إرسال الإشعار', 'error')
  } finally {
    testingNotification.value = false
  }
}

// Show snackbar
const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Check subscription on mount
onMounted(async () => {
  if (notifications.isSupported.value) {
    notificationsEnabled.value = await notifications.checkSubscription()
  }
})
</script>
