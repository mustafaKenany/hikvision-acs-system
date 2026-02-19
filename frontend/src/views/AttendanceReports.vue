<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5">تقارير الحضور والانصراف</v-card-title>

      <v-card-text>
        <!-- Filters -->
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="reportType"
              :items="reportTypes"
              label="نوع التقرير *"
              item-title="text"
              item-value="value"
              outlined
              dense
              @update:model-value="loadReport"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.start_date"
              label="تاريخ البداية *"
              type="date"
              outlined
              dense
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.end_date"
              label="تاريخ النهاية *"
              type="date"
              outlined
              dense
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filters.employee_id"
              :items="employees"
              label="الموظف (اختياري)"
              item-title="full_name"
              item-value="id"
              outlined
              dense
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filters.department_id"
              :items="departments"
              label="القسم (اختياري)"
              item-title="name"
              item-value="id"
              outlined
              dense
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn color="primary" block @click="loadReport" :loading="loading">
              <v-icon start>mdi-filter</v-icon>
              تطبيق الفلاتر
            </v-btn>
          </v-col>

          <v-col cols="12" md="3">
            <v-btn color="success" block @click="exportToExcel" :disabled="!reportData.length">
              <v-icon start>mdi-microsoft-excel</v-icon>
              تصدير Excel
            </v-btn>
          </v-col>

          <v-col cols="12" md="3">
            <v-btn color="info" block @click="calculateAttendance" :loading="calculating">
              <v-icon start>mdi-calculator</v-icon>
              حساب الحضور
            </v-btn>
          </v-col>
        </v-row>

        <!-- Statistics Cards -->
        <v-row v-if="statistics" class="mt-4">
          <v-col cols="12" md="3">
            <v-card color="success" dark>
              <v-card-text>
                <div class="text-h4">{{ statistics.total_present || 0 }}</div>
                <div>حضور</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card color="warning" dark>
              <v-card-text>
                <div class="text-h4">{{ statistics.total_late || 0 }}</div>
                <div>متأخر</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card color="error" dark>
              <v-card-text>
                <div class="text-h4">{{ statistics.total_absent || 0 }}</div>
                <div>غياب</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <v-card color="info" dark>
              <v-card-text>
                <div class="text-h4">{{ formatHours(statistics.total_overtime_hours) }}</div>
                <div>ساعات إضافية</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Search Bar -->
        <v-row class="mt-2">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="tableSearch"
              prepend-inner-icon="mdi-magnify"
              label="بحث في الجدول"
              clearable
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="currentHeaders"
          :items="reportData"
          :loading="loading"
          :items-per-page="25"
          :search="tableSearch"
          class="elevation-1 mt-4"
        >
          <template v-slot:item.employee="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.Employee?.full_name }}</div>
              <div class="text-caption text-grey">{{ item.Employee?.employee_code }}</div>
            </div>
          </template>

          <template v-slot:item.date="{ item }">
            {{ formatDate(item.date) }}
          </template>

          <template v-slot:item.check_in_time="{ item }">
            {{ formatTime(item.check_in_time) }}
          </template>

          <template v-slot:item.check_out_time="{ item }">
            {{ formatTime(item.check_out_time) }}
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small">
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.is_late="{ item }">
            <v-chip :color="item.is_late ? 'warning' : 'success'" size="small">
              {{ item.is_late ? 'متأخر' : 'في الموعد' }}
            </v-chip>
          </template>

          <template v-slot:item.late_minutes="{ item }">
            <span v-if="item.late_minutes > 0" class="text-warning">
              {{ item.late_minutes }} دقيقة
            </span>
            <span v-else>-</span>
          </template>

          <template v-slot:item.working_hours="{ item }">
            {{ formatHours(item.working_hours) }}
          </template>

          <template v-slot:item.overtime_hours="{ item }">
            <span v-if="item.overtime_hours > 0" class="text-info">
              {{ formatHours(item.overtime_hours) }}
            </span>
            <span v-else>-</span>
          </template>

          <template v-slot:item.break_hours="{ item }">
            {{ formatHours(item.break_hours) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import axios from '@/api/axios'
import { useSnackbar } from '@/composables/useSnackbar'
import * as XLSX from 'xlsx'

const { showSuccess, showError } = useSnackbar()

const loading = ref(false)
const calculating = ref(false)
const reportType = ref('daily')
const reportData = ref([])
const statistics = ref(null)
const employees = ref([])
const departments = ref([])
const tableSearch = ref('')

const today = format(new Date(), 'yyyy-MM-dd')
const filters = ref({
  start_date: today,
  end_date: today,
  employee_id: null,
  department_id: null
})

const reportTypes = [
  { text: 'تقرير يومي', value: 'daily' },
  { text: 'تقرير شهري', value: 'monthly' },
  { text: 'تقرير التأخيرات', value: 'late' },
  { text: 'تقرير الساعات الإضافية', value: 'overtime' },
  { text: 'تقرير الغياب', value: 'absence' }
]

const dailyHeaders = [
  { title: 'الموظف', key: 'employee' },
  { title: 'التاريخ', key: 'date' },
  { title: 'دخول', key: 'check_in_time' },
  { title: 'خروج', key: 'check_out_time' },
  { title: 'الحالة', key: 'status' },
  { title: 'تأخير', key: 'is_late' },
  { title: 'دقائق التأخير', key: 'late_minutes' },
  { title: 'ساعات العمل', key: 'working_hours' },
  { title: 'ساعات إضافية', key: 'overtime_hours' },
  { title: 'استراحة', key: 'break_hours' }
]

const monthlyHeaders = [
  { title: 'الموظف', key: 'employee' },
  { title: 'أيام الحضور', key: 'present_days' },
  { title: 'أيام التأخير', key: 'late_days' },
  { title: 'أيام الغياب', key: 'absent_days' },
  { title: 'إجمالي الساعات', key: 'total_working_hours' },
  { title: 'ساعات إضافية', key: 'total_overtime_hours' },
  { title: 'إجمالي التأخير (دقيقة)', key: 'total_late_minutes' }
]

const lateHeaders = [
  { title: 'الموظف', key: 'employee' },
  { title: 'التاريخ', key: 'date' },
  { title: 'وقت الدخول', key: 'check_in_time' },
  { title: 'دقائق التأخير', key: 'late_minutes' }
]

const overtimeHeaders = [
  { title: 'الموظف', key: 'employee' },
  { title: 'التاريخ', key: 'date' },
  { title: 'ساعات العمل', key: 'working_hours' },
  { title: 'ساعات إضافية', key: 'overtime_hours' }
]

const absenceHeaders = [
  { title: 'الموظف', key: 'employee' },
  { title: 'التاريخ', key: 'date' },
  { title: 'الحالة', key: 'status' }
]

const currentHeaders = computed(() => {
  switch (reportType.value) {
    case 'daily': return dailyHeaders
    case 'monthly': return monthlyHeaders
    case 'late': return lateHeaders
    case 'overtime': return overtimeHeaders
    case 'absence': return absenceHeaders
    default: return dailyHeaders
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return format(parseISO(dateStr), 'dd/MM/yyyy')
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return timeStr.substring(0, 5) // HH:MM
}

const formatHours = (hours) => {
  if (!hours) return '0'
  return parseFloat(hours).toFixed(2)
}

const getStatusColor = (status) => {
  const colors = {
    present: 'success',
    late: 'warning',
    absent: 'error',
    half_day: 'info',
    holiday: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    present: 'حاضر',
    late: 'متأخر',
    absent: 'غائب',
    half_day: 'نصف يوم',
    holiday: 'عطلة'
  }
  return texts[status] || status
}

const loadEmployees = async () => {
  try {
    const response = await axios.get('/employees')
    employees.value = response.data.data.employees
  } catch (error) {
    console.error('Failed to load employees')
  }
}

const loadDepartments = async () => {
  try {
    const response = await axios.get('/employees/departments/list')
    departments.value = response.data.data.departments
  } catch (error) {
    console.error('Failed to load departments')
  }
}

const loadReport = async () => {
  loading.value = true
  try {
    let endpoint = ''
    const params = {
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      employee_id: filters.value.employee_id,
      department_id: filters.value.department_id
    }

    switch (reportType.value) {
      case 'daily':
        endpoint = '/reports/attendance/daily'
        break
      case 'monthly':
        endpoint = '/reports/attendance/monthly'
        break
      case 'late':
        endpoint = '/reports/late-arrivals'
        break
      case 'overtime':
        endpoint = '/reports/overtime'
        break
      case 'absence':
        endpoint = '/reports/absences'
        break
    }

    const response = await axios.get(endpoint, { params })
    reportData.value = response.data.data.records || response.data.data.report || []
    statistics.value = response.data.data.statistics || response.data.data.summary || null
  } catch (error) {
    showError(error.response?.data?.message || 'فشل تحميل التقرير')
    reportData.value = []
    statistics.value = null
  } finally {
    loading.value = false
  }
}

const calculateAttendance = async () => {
  calculating.value = true
  try {
    await axios.post('/reports/attendance/calculate', {
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      employee_id: filters.value.employee_id
    })
    showSuccess('تم حساب الحضور بنجاح')
    loadReport()
  } catch (error) {
    showError(error.response?.data?.message || 'فشل حساب الحضور')
  } finally {
    calculating.value = false
  }
}

const exportToExcel = () => {
  if (!reportData.value.length) {
    showError('لا توجد بيانات للتصدير')
    return
  }

  const worksheet = XLSX.utils.json_to_sheet(
    reportData.value.map(item => ({
      'الموظف': item.Employee?.full_name || item.employee_name || '',
      'التاريخ': formatDate(item.date),
      'دخول': formatTime(item.check_in_time),
      'خروج': formatTime(item.check_out_time),
      'الحالة': getStatusText(item.status),
      'تأخير': item.is_late ? 'نعم' : 'لا',
      'دقائق التأخير': item.late_minutes || 0,
      'ساعات العمل': formatHours(item.working_hours),
      'ساعات إضافية': formatHours(item.overtime_hours)
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الحضور')
  
  const fileName = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
  XLSX.writeFile(workbook, fileName)
  
  showSuccess('تم تصدير التقرير بنجاح')
}

onMounted(() => {
  loadEmployees()
  loadDepartments()
  loadReport()
})
</script>
