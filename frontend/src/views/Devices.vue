<template>
  <div class="pa-4">
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          <v-icon size="large" class="ml-2">mdi-devices</v-icon>
          إدارة الأجهزة
        </h1>
        <p class="text-subtitle-1 text-grey mt-2">
          إدارة أجهزة التحكم بالدخول والحضور
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="secondary"
          prepend-icon="mdi-radar"
          @click="openDiscoveryDialog"
          size="large"
          variant="outlined"
          class="ml-2"
        >
          البحث عن الأجهزة
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          size="large"
        >
          إضافة جهاز يدوياً
        </v-btn>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
                <div class="text-subtitle-2 text-grey">إجمالي الأجهزة</div>
              </div>
              <v-icon size="40" color="primary">mdi-devices</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.online }}</div>
                <div class="text-subtitle-2 text-grey">متصلة</div>
              </div>
              <v-icon size="40" color="success">mdi-lan-connect</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.offline }}</div>
                <div class="text-subtitle-2 text-grey">غير متصلة</div>
              </div>
              <v-icon size="40" color="error">mdi-lan-disconnect</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.active }}</div>
                <div class="text-subtitle-2 text-grey">مفعّلة</div>
              </div>
              <v-icon size="40" color="info">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters & Search -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="بحث..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
              placeholder="ابحث عن جهاز..."
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.device_type"
              label="نوع الجهاز"
              :items="deviceTypeFilter"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-shape"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.is_active"
              label="الحالة"
              :items="statusFilter"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-toggle-switch"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.is_online"
              label="الاتصال"
              :items="onlineFilter"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-lan"
            />
          </v-col>

          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              color="primary"
              @click="loadDevices"
              :loading="loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Devices Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="devices"
        :loading="loading"
        :items-per-page="pagination.limit"
        hide-default-footer
        class="elevation-1"
      >
        <!-- Device Info -->
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="40" class="ml-3">
              <v-icon color="white">{{ getDeviceIcon(item.device_type) }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ item.serial_number || 'لا يوجد رقم تسلسلي' }}</div>
            </div>
          </div>
        </template>

        <!-- Device Type -->
        <template #item.device_type="{ item }">
          <v-chip size="small" color="info">
            {{ getDeviceTypeLabel(item.device_type) }}
          </v-chip>
        </template>

        <!-- Network Info -->
        <template #item.ip_address="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.ip_address }}</div>
            <div class="text-caption text-grey">Port: {{ item.port }}</div>
          </div>
        </template>

        <!-- Location -->
        <template #item.location="{ item }">
          {{ item.location || '-' }}
        </template>

        <!-- Online Status -->
        <template #item.is_online="{ item }">
          <v-chip
            :color="item.is_online ? 'success' : 'error'"
            size="small"
            variant="flat"
          >
            <v-icon start size="small">
              {{ item.is_online ? 'mdi-lan-connect' : 'mdi-lan-disconnect' }}
            </v-icon>
            {{ item.is_online ? 'متصل' : 'غير متصل' }}
          </v-chip>
        </template>

        <!-- Active Status -->
        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ item.is_active ? 'مفعّل' : 'معطّل' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="viewDeviceInfo(item)">
                <template #prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                <v-list-item-title>معلومات الجهاز</v-list-item-title>
              </v-list-item>

              <v-list-item @click="testConnection(item)">
                <template #prepend>
                  <v-icon>mdi-lan-check</v-icon>
                </template>
                <v-list-item-title>اختبار الاتصال</v-list-item-title>
              </v-list-item>

              <v-list-item @click="syncTime(item)" :disabled="!item.is_online">
                <template #prepend>
                  <v-icon>mdi-clock-check</v-icon>
                </template>
                <v-list-item-title>مزامنة الوقت</v-list-item-title>
              </v-list-item>

              <v-list-item @click="syncDevice(item)" :disabled="!item.is_online">
                <template #prepend>
                  <v-icon>mdi-sync</v-icon>
                </template>
                <v-list-item-title>مزامنة الموظفين</v-list-item-title>
              </v-list-item>

              <v-list-item @click="pullLogs(item)" :disabled="!item.is_online">
                <template #prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>سحب السجلات</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="rebootDevice(item)" :disabled="!item.is_online">
                <template #prepend>
                  <v-icon>mdi-restart</v-icon>
                </template>
                <v-list-item-title>إعادة تشغيل</v-list-item-title>
              </v-list-item>

              <v-list-item @click="clearDeviceLogs(item)" :disabled="!item.is_online" class="text-warning">
                <template #prepend>
                  <v-icon color="warning">mdi-broom</v-icon>
                </template>
                <v-list-item-title>مسح سجلات الجهاز</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="openDialog(item)">
                <template #prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>تعديل</v-list-item-title>
              </v-list-item>

              <v-list-item
                @click="toggleStatus(item)"
                :disabled="!item.is_online"
              >
                <template #prepend>
                  <v-icon>{{ item.is_active ? 'mdi-cancel' : 'mdi-check-circle' }}</v-icon>
                </template>
                <v-list-item-title>
                  {{ item.is_active ? 'تعطيل' : 'تفعيل' }}
                </v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="confirmDelete(item)" class="text-error">
                <template #prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title>حذف</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Device Dialog -->
    <DeviceDialog
      v-model="dialogOpen"
      :device="selectedDevice"
      @saved="handleSaved"
    />

    <!-- Device Discovery Dialog -->
    <DeviceDiscoveryDialog
      v-model="discoveryDialogOpen"
      @deviceAdded="handleDiscoveredDevice"
    />

    <!-- Device Info Dialog -->
    <v-dialog v-model="infoDialog" max-width="700">
      <v-card v-if="deviceInfo">
        <v-card-title class="bg-info text-white">
          <v-icon class="ml-2">mdi-information</v-icon>
          معلومات الجهاز
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="6">
              <strong>اسم الجهاز:</strong>
            </v-col>
            <v-col cols="6">
              {{ deviceInfo.deviceName || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>الموديل:</strong>
            </v-col>
            <v-col cols="6">
              {{ deviceInfo.model || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>الرقم التسلسلي:</strong>
            </v-col>
            <v-col cols="6">
              {{ deviceInfo.serialNumber || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>إصدار Firmware:</strong>
            </v-col>
            <v-col cols="6">
              {{ deviceInfo.firmwareVersion || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>تاريخ الإصدار:</strong>
            </v-col>
            <v-col cols="6">
              {{ deviceInfo.firmwareReleasedDate || 'N/A' }}
            </v-col>

            <v-col cols="6" v-if="deviceInfo.capacity">
              <strong>السعة القصوى:</strong>
            </v-col>
            <v-col cols="6" v-if="deviceInfo.capacity">
              {{ deviceInfo.capacity.maxFaceNum || 'N/A' }} وجه
            </v-col>

            <v-col cols="6" v-if="deviceInfo.capacity">
              <strong>المستخدم حالياً:</strong>
            </v-col>
            <v-col cols="6" v-if="deviceInfo.capacity">
              {{ deviceInfo.capacity.currentFaceNum || 0 }} وجه
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="infoDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon class="ml-2">mdi-alert</v-icon>
          تأكيد الحذف
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-h6 mb-2">هل أنت متأكد من حذف هذا الجهاز؟</p>
          <p class="text-subtitle-1 text-grey">
            الجهاز: <strong>{{ deviceToDelete?.name }}</strong>
          </p>
          <v-alert color="warning" variant="tonal" class="mt-4">
            <v-icon>mdi-information</v-icon>
            لن يتم حذف السجلات المرتبطة بالجهاز
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">إلغاء</v-btn>
          <v-btn color="error" @click="deleteDevice" :loading="deleteLoading">
            تأكيد الحذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from '@/api/axios'
import DeviceDialog from '@/components/dialogs/DeviceDialog.vue'
import DeviceDiscoveryDialog from '@/components/dialogs/DeviceDiscoveryDialog.vue'

const loading = ref(false)
const devices = ref([])
const dialogOpen = ref(false)
const discoveryDialogOpen = ref(false)
const infoDialog = ref(false)
const deviceInfo = ref(null)
const selectedDevice = ref(null)
const search = ref('')
const deleteDialog = ref(false)
const deviceToDelete = ref(null)
const deleteLoading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  limit: 10
})

const filters = reactive({
  device_type: null,
  is_active: null,
  is_online: null
})

const openDiscoveryDialog = () => {
  discoveryDialogOpen.value = true
}

const handleDiscoveredDevice = (deviceData) => {
  // Open dialog with pre-filled data from discovery
  selectedDevice.value = deviceData
  dialogOpen.value = true
  discoveryDialogOpen.value = false
}

const stats = reactive({
  total: 0,
  online: 0,
  offline: 0,
  active: 0
})

const headers = [
  { title: 'الجهاز', key: 'name', sortable: false },
  { title: 'النوع', key: 'device_type', sortable: false },
  { title: 'الشبكة', key: 'ip_address', sortable: false },
  { title: 'الموقع', key: 'location', sortable: false },
  { title: 'الاتصال', key: 'is_online', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]

const deviceTypeFilter = [
  { title: 'قارئ بصمة الوجه', value: 'face_reader' },
  { title: 'قارئ بصمة الإصبع', value: 'fingerprint_reader' },
  { title: 'قارئ البطاقات', value: 'card_reader' },
  { title: 'جهاز متعدد الوظائف', value: 'multi_biometric' },
  { title: 'آخر', value: 'other' }
]

const statusFilter = [
  { title: 'مفعّل', value: 'true' },
  { title: 'معطّل', value: 'false' }
]

const onlineFilter = [
  { title: 'متصل', value: 'true' },
  { title: 'غير متصل', value: 'false' }
]

const loadDevices = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      search: search.value,
      ...filters
    }

    const response = await axios.get('/devices', { params })
    devices.value = response.data.data.devices
    pagination.totalPages = response.data.data.pagination.totalPages
    pagination.total = response.data.data.pagination.total

    // Update stats
    stats.total = pagination.total
    stats.online = devices.value.filter(d => d.is_online).length
    stats.offline = devices.value.filter(d => !d.is_online).length
    stats.active = devices.value.filter(d => d.is_active).length
  } catch (error) {
    console.error('Error loading devices:', error)
    showSnackbar('حدث خطأ أثناء تحميل الأجهزة', 'error')
  } finally {
    loading.value = false
  }
}

const openDialog = (device = null) => {
  selectedDevice.value = device
  dialogOpen.value = true
}

const handleSaved = () => {
  loadDevices()
  showSnackbar(selectedDevice.value ? 'تم تعديل الجهاز بنجاح' : 'تم إضافة الجهاز بنجاح', 'success')
}

const testConnection = async (device) => {
  loading.value = true
  try {
    const response = await axios.post(`/devices/${device.id}/test-connection`)
    if (response.data.data.is_connected) {
      showSnackbar('✅ الاتصال ناجح', 'success')
    } else {
      showSnackbar('❌ فشل الاتصال', 'error')
    }
    loadDevices()
  } catch (error) {
    console.error('Error testing connection:', error)
    showSnackbar('حدث خطأ أثناء اختبار الاتصال', 'error')
  } finally {
    loading.value = false
  }
}

const viewDeviceInfo = async (device) => {
  loading.value = true
  try {
    const response = await axios.get(`/devices/${device.id}/info`)
    deviceInfo.value = response.data.data
    infoDialog.value = true
  } catch (error) {
    console.error('Error getting device info:', error)
    showSnackbar('حدث خطأ أثناء جلب المعلومات', 'error')
  } finally {
    loading.value = false
  }
}

const syncTime = async (device) => {
  loading.value = true
  try {
    await axios.post(`/devices/${device.id}/sync-time`)
    showSnackbar('✅ تمت مزامنة الوقت بنجاح', 'success')
  } catch (error) {
    console.error('Error syncing time:', error)
    showSnackbar('حدث خطأ أثناء مزامنة الوقت', 'error')
  } finally {
    loading.value = false
  }
}

const pullLogs = async (device) => {
  loading.value = true
  try {
    const response = await axios.post(`/devices/${device.id}/pull-logs`)
    const count = response.data.data?.count || 0
    showSnackbar(`✅ تم سحب ${count} سجل بنجاح`, 'success')
  } catch (error) {
    console.error('Error pulling logs:', error)
    showSnackbar('حدث خطأ أثناء سحب السجلات', 'error')
  } finally {
    loading.value = false
  }
}

const rebootDevice = async (device) => {
  if (!confirm(`هل أنت متأكد من إعادة تشغيل الجهاز "${device.name}"؟`)) return
  
  loading.value = true
  try {
    await axios.post(`/devices/${device.id}/reboot`)
    showSnackbar('✅ تم إرسال أمر إعادة التشغيل', 'success')
  } catch (error) {
    console.error('Error rebooting device:', error)
    showSnackbar('حدث خطأ أثناء إعادة التشغيل', 'error')
  } finally {
    loading.value = false
  }
}

const clearDeviceLogs = async (device) => {
  if (!confirm(`⚠️ هل أنت متأكد من مسح سجلات الجهاز "${device.name}"؟\nتأكد من سحب السجلات أولاً!`)) return
  
  loading.value = true
  try {
    await axios.post(`/devices/${device.id}/clear-logs`)
    showSnackbar('✅ تم مسح سجلات الجهاز', 'success')
  } catch (error) {
    console.error('Error clearing logs:', error)
    showSnackbar('حدث خطأ أثناء مسح السجلات', 'error')
  } finally {
    loading.value = false
  }
}

const syncDevice = async (device) => {
  loading.value = true
  try {
    await axios.post(`/devices/${device.id}/sync`)
    showSnackbar('✅ تمت المزامنة بنجاح', 'success')
    loadDevices()
  } catch (error) {
    console.error('Error syncing device:', error)
    showSnackbar('حدث خطأ أثناء المزامنة', 'error')
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (device) => {
  try {
    const action = device.is_active ? 'deactivate' : 'activate'
    await axios.post(`/devices/${device.id}/${action}`)
    showSnackbar(`تم ${device.is_active ? 'تعطيل' : 'تفعيل'} الجهاز بنجاح`, 'success')
    loadDevices()
  } catch (error) {
    console.error('Error toggling status:', error)
    showSnackbar('حدث خطأ أثناء تغيير الحالة', 'error')
  }
}

const confirmDelete = (device) => {
  deviceToDelete.value = device
  deleteDialog.value = true
}

const deleteDevice = async () => {
  deleteLoading.value = true
  try {
    await axios.delete(`/devices/${deviceToDelete.value.id}`)
    showSnackbar('تم حذف الجهاز بنجاح', 'success')
    deleteDialog.value = false
    loadDevices()
  } catch (error) {
    console.error('Error deleting device:', error)
    showSnackbar('حدث خطأ أثناء الحذف', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const getDeviceIcon = (type) => {
  const icons = {
    face_reader: 'mdi-face-recognition',
    fingerprint_reader: 'mdi-fingerprint',
    card_reader: 'mdi-card-account-details',
    multi_biometric: 'mdi-shield-account',
    other: 'mdi-devices'
  }
  return icons[type] || 'mdi-devices'
}

const getDeviceTypeLabel = (type) => {
  const labels = {
    face_reader: 'قارئ بصمة الوجه',
    fingerprint_reader: 'قارئ بصمة الإصبع',
    card_reader: 'قارئ البطاقات',
    multi_biometric: 'متعدد الوظائف',
    other: 'آخر'
  }
  return labels[type] || type
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

watch([search, filters], () => {
  pagination.currentPage = 1
  loadDevices()
}, { deep: true })

onMounted(() => {
  loadDevices()
})
</script>
