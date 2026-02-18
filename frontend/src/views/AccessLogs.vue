<template>
  <div class="pa-4">
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          <v-icon size="large" class="ml-2">mdi-login</v-icon>
          سجلات الدخول والحضور
        </h1>
        <p class="text-subtitle-1 text-grey mt-2">
          سجل البصمات وأوقات الحضور والانصراف
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="success"
          prepend-icon="mdi-microsoft-excel"
          variant="outlined"
          @click="exportToExcel"
          :disabled="logs.length === 0"
          class="ml-2"
        >
          تصدير Excel
        </v-btn>
        <v-btn
          color="error"
          prepend-icon="mdi-file-pdf-box"
          variant="outlined"
          @click="exportToPDF"
          :disabled="logs.length === 0"
          class="ml-2"
        >
          تصدير PDF
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              color="primary"
              prepend-icon="mdi-download"
              v-bind="props"
            >
              سحب السجلات
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="pullFromDevice">
              <template #prepend>
                <v-icon>mdi-devices</v-icon>
              </template>
              <v-list-item-title>سحب من جهاز محدد</v-list-item-title>
            </v-list-item>
            <v-list-item @click="pullFromAllDevices">
              <template #prepend>
                <v-icon>mdi-sync</v-icon>
              </template>
              <v-list-item-title>سحب من جميع الأجهزة</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.today }}</div>
                <div class="text-subtitle-2 text-grey">سجلات اليوم</div>
              </div>
              <v-icon size="40" color="primary">mdi-calendar-today</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.thisWeek }}</div>
                <div class="text-subtitle-2 text-grey">هذا الأسبوع</div>
              </div>
              <v-icon size="40" color="success">mdi-calendar-week</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.thisMonth }}</div>
                <div class="text-subtitle-2 text-grey">هذا الشهر</div>
              </div>
              <v-icon size="40" color="info">mdi-calendar-month</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
                <div class="text-subtitle-2 text-grey">إجمالي السجلات</div>
              </div>
              <v-icon size="40" color="warning">mdi-chart-line</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              label="بحث..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
              placeholder="اسم الموظف أو رقمه..."
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.device_id"
              label="الجهاز"
              :items="devicesList"
              item-title="name"
              item-value="id"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-devices"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.date_from"
              label="من تاريخ"
              type="date"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.date_to"
              label="إلى تاريخ"
              type="date"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.log_type"
              label="نوع السجل"
              :items="logTypes"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-filter"
            />
          </v-col>

          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              color="primary"
              @click="loadLogs"
              :loading="loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Access Logs Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :items-per-page="pagination.limit"
        hide-default-footer
        class="elevation-1"
      >
        <!-- Employee Info -->
        <template #item.employee="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="40" class="ml-3" color="primary">
              <v-img
                v-if="item.employee?.photo_url"
                :src="`${API_BASE_URL}${item.employee.photo_url}`"
                cover
              />
              <v-icon v-else color="white">mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">
                {{ item.employee?.name || item.employee?.name_ar || 'غير معروف' }}
              </div>
              <div class="text-caption text-grey">
                رقم الموظف: {{ item.employee_no || item.employee_id || 'N/A' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Log Type -->
        <template #item.log_type="{ item }">
          <v-chip
            :color="getLogTypeColor(item.log_type)"
            size="small"
            variant="flat"
          >
            <v-icon start size="small">
              {{ getLogTypeIcon(item.log_type) }}
            </v-icon>
            {{ getLogTypeLabel(item.log_type) }}
          </v-chip>
        </template>

        <!-- Timestamp -->
        <template #item.timestamp="{ item }">
          <div>
            <div class="font-weight-medium">{{ formatDate(item.timestamp) }}</div>
            <div class="text-caption text-grey">{{ formatTime(item.timestamp) }}</div>
          </div>
        </template>

        <!-- Device -->
        <template #item.device="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.device?.name || 'N/A' }}</div>
            <div class="text-caption text-grey">{{ item.device?.location || '-' }}</div>
          </div>
        </template>

        <!-- Verification Method -->
        <template #item.verification_method="{ item }">
          <v-chip size="small" variant="tonal" color="info">
            {{ getVerificationLabel(item.verification_method) }}
          </v-chip>
        </template>

        <!-- Temperature -->
        <template #item.temperature="{ item }">
          <span v-if="item.temperature">
            {{ item.temperature }}°C
            <v-icon
              v-if="item.temperature > 37.5"
              color="error"
              size="small"
            >
              mdi-alert
            </v-icon>
          </span>
          <span v-else class="text-grey">-</span>
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
              <v-list-item @click="viewDetails(item)">
                <template #prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>عرض التفاصيل</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="item.photo" @click="viewPhoto(item)">
                <template #prepend>
                  <v-icon>mdi-image</v-icon>
                </template>
                <v-list-item-title>عرض الصورة</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-login-variant</v-icon>
            <p class="text-h6 mt-4 text-grey">لا توجد سجلات</p>
            <v-btn color="primary" @click="pullFromDevice" class="mt-4">
              سحب السجلات من الأجهزة
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-divider />
      <div class="pa-4 d-flex justify-center">
        <v-pagination
          v-model="pagination.currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          @update:model-value="loadLogs"
        />
      </div>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card v-if="selectedLog">
        <v-card-title class="bg-primary text-white">
          <v-icon class="ml-2">mdi-information</v-icon>
          تفاصيل السجل
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="6">
              <strong>الموظف:</strong>
            </v-col>
            <v-col cols="6">
              {{ selectedLog.employee?.name || 'غير معروف' }}
            </v-col>

            <v-col cols="6">
              <strong>رقم الموظف:</strong>
            </v-col>
            <v-col cols="6">
              {{ selectedLog.employee_no || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>الوقت:</strong>
            </v-col>
            <v-col cols="6">
              {{ formatDateTime(selectedLog.timestamp) }}
            </v-col>

            <v-col cols="6">
              <strong>الجهاز:</strong>
            </v-col>
            <v-col cols="6">
              {{ selectedLog.device?.name || 'N/A' }}
            </v-col>

            <v-col cols="6">
              <strong>طريقة التحقق:</strong>
            </v-col>
            <v-col cols="6">
              {{ getVerificationLabel(selectedLog.verification_method) }}
            </v-col>

            <v-col cols="6" v-if="selectedLog.temperature">
              <strong>درجة الحرارة:</strong>
            </v-col>
            <v-col cols="6" v-if="selectedLog.temperature">
              {{ selectedLog.temperature }}°C
            </v-col>

            <v-col cols="6" v-if="selectedLog.mask_detection !== undefined">
              <strong>كمامة:</strong>
            </v-col>
            <v-col cols="6" v-if="selectedLog.mask_detection !== undefined">
              {{ selectedLog.mask_detection ? 'نعم' : 'لا' }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailsDialog = false">إغلاق</v-btn>
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
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const loading = ref(false)
const logs = ref([])
const devicesList = ref([])
const search = ref('')
const detailsDialog = ref(false)
const selectedLog = ref(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const filters = reactive({
  device_id: null,
  date_from: null,
  date_to: null,
  log_type: null
})

const pagination = reactive({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  limit: 20
})

const stats = reactive({
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  total: 0
})

const headers = [
  { title: 'الموظف', key: 'employee', sortable: false },
  { title: 'النوع', key: 'log_type', sortable: false },
  { title: 'التاريخ والوقت', key: 'timestamp', sortable: false },
  { title: 'الجهاز', key: 'device', sortable: false },
  { title: 'طريقة التحقق', key: 'verification_method', sortable: false },
  { title: 'درجة الحرارة', key: 'temperature', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]

const logTypes = [
  { title: 'دخول', value: 'check_in' },
  { title: 'خروج', value: 'check_out' },
  { title: 'استراحة', value: 'break' },
  { title: 'عودة من استراحة', value: 'break_end' }
]

const loadLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      search: search.value,
      ...filters
    }

    const response = await axios.get('/access-logs', { params })
    logs.value = response.data.data.logs || []
    pagination.totalPages = response.data.data.pagination?.totalPages || 1
    pagination.total = response.data.data.pagination?.total || 0

    // Update total in stats
    stats.total = pagination.total
  } catch (error) {
    console.error('Error loading logs:', error)
    showSnackbar('حدث خطأ أثناء تحميل السجلات', 'error')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await axios.get('/access-logs/stats')
    const data = response.data.data
    
    stats.today = data.todayCount || 0
    stats.thisWeek = data.weekCount || 0
    stats.thisMonth = data.monthCount || 0
    stats.total = data.totalCount || 0
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadDevices = async () => {
  try {
    const response = await axios.get('/devices', { params: { limit: 1000 } })
    devicesList.value = response.data.data.devices || []
  } catch (error) {
    console.error('Error loading devices:', error)
  }
}

const pullFromDevice = () => {
  // TODO: Show dialog to select device and pull logs
  showSnackbar('قيد التطوير...', 'info')
}

const pullFromAllDevices = async () => {
  loading.value = true
  try {
    await axios.post('/access-logs/pull-all')
    showSnackbar('تم سحب السجلات بنجاح', 'success')
    loadLogs()
  } catch (error) {
    console.error('Error pulling logs:', error)
    showSnackbar('حدث خطأ أثناء سحب السجلات', 'error')
  } finally {
    loading.value = false
  }
}

const viewDetails = (log) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const viewPhoto = (log) => {
  if (log.photo) {
    window.open(`${API_BASE_URL}${log.photo}`, '_blank')
  }
}

const exportToExcel = () => {
  try {
    // Prepare data for Excel
    const excelData = logs.value.map(log => ({
      'رقم الموظف': log.employee_no || 'N/A',
      'اسم الموظف': log.employee?.name || 'غير معروف',
      'نوع السجل': getLogTypeLabel(log.log_type),
      'التاريخ': formatDate(log.timestamp),
      'الوقت': formatTime(log.timestamp),
      'الجهاز': log.device?.name || 'N/A',
      'الموقع': log.device?.location || 'N/A',
      'طريقة التحقق': getVerificationLabel(log.verification_method),
      'درجة الحرارة': log.temperature ? `${log.temperature}°C` : '-',
      'كمامة': log.mask_detection !== undefined ? (log.mask_detection ? 'نعم' : 'لا') : '-'
    }))

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'سجلات الدخول')

    // Generate file name
    const fileName = `access-logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`

    // Download
    XLSX.writeFile(wb, fileName)
    showSnackbar('تم تصدير البيانات إلى Excel بنجاح', 'success')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    showSnackbar('حدث خطأ أثناء التصدير', 'error')
  }
}

const exportToPDF = () => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4') // Landscape orientation

    // Add title
    doc.setFontSize(16)
    doc.text('Access Logs Report - تقرير سجلات الدخول', 148, 15, { align: 'center' })

    // Add stats
    doc.setFontSize(10)
    doc.text(`Total: ${stats.total} | Today: ${stats.today} | This Week: ${stats.thisWeek} | This Month: ${stats.thisMonth}`, 148, 22, { align: 'center' })
    doc.text(`Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 148, 28, { align: 'center' })

    // Prepare table data
    const tableData = logs.value.map(log => [
      log.employee_no || 'N/A',
      log.employee?.name || 'Unknown',
      getLogTypeLabel(log.log_type),
      formatDate(log.timestamp),
      formatTime(log.timestamp),
      log.device?.name || 'N/A',
      getVerificationLabel(log.verification_method),
      log.temperature ? `${log.temperature}°C` : '-'
    ])

    // Add table
    doc.autoTable({
      head: [['Employee No', 'Name', 'Type', 'Date', 'Time', 'Device', 'Verification', 'Temp']],
      body: tableData,
      startY: 35,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    // Save PDF
    const fileName = `access-logs-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    doc.save(fileName)
    showSnackbar('تم تصدير البيانات إلى PDF بنجاح', 'success')
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    showSnackbar('حدث خطأ أثناء التصدير', 'error')
  }
}

const getLogTypeColor = (type) => {
  const colors = {
    check_in: 'success',
    check_out: 'info',
    break: 'warning',
    break_end: 'secondary'
  }
  return colors[type] || 'grey'
}

const getLogTypeIcon = (type) => {
  const icons = {
    check_in: 'mdi-login',
    check_out: 'mdi-logout',
    break: 'mdi-coffee',
    break_end: 'mdi-coffee-off'
  }
  return icons[type] || 'mdi-help'
}

const getLogTypeLabel = (type) => {
  const labels = {
    check_in: 'دخول',
    check_out: 'خروج',
    break: 'استراحة',
    break_end: 'عودة'
  }
  return labels[type] || type
}

const getVerificationLabel = (method) => {
  const labels = {
    face: 'بصمة الوجه',
    fingerprint: 'بصمة الإصبع',
    card: 'البطاقة',
    password: 'كلمة المرور'
  }
  return labels[method] || method || 'N/A'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'yyyy-MM-dd', { locale: ar })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'HH:mm:ss', { locale: ar })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', { locale: ar })
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

watch([search, filters], () => {
  pagination.currentPage = 1
  loadLogs()
}, { deep: true })

onMounted(() => {
  loadLogs()
  loadDevices()
  loadStats()
})
</script>
