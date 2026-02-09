<template>
  <div>
    <h1 class="text-h4 mb-6">إدارة الموظفين</h1>

    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
                <div class="text-subtitle-2">إجمالي الموظفين</div>
              </div>
              <v-icon size="48">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.active }}</div>
                <div class="text-subtitle-2">النشطين</div>
              </div>
              <v-icon size="48">mdi-account-check</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.inactive }}</div>
                <div class="text-subtitle-2">غير النشطين</div>
              </div>
              <v-icon size="48">mdi-account-off</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.departments }}</div>
                <div class="text-subtitle-2">الأقسام</div>
              </div>
              <v-icon size="48">mdi-domain</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <!-- Advanced Filters -->
      <v-card-title class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              prepend-inner-icon="mdi-magnify"
              label="بحث..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.organization_id"
              label="المنظمة"
              variant="outlined"
              density="compact"
              :items="organizations"
              item-title="name"
              item-value="id"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.department"
              label="القسم"
              variant="outlined"
              density="compact"
              :items="departments"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              label="الحالة"
              variant="outlined"
              density="compact"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3" class="d-flex gap-2">
            <v-btn color="primary" @click="applyFilters" block>
              <v-icon start>mdi-filter</v-icon>
              تطبيق
            </v-btn>
            <v-btn color="grey" variant="outlined" @click="resetFilters" block>
              <v-icon start>mdi-filter-off</v-icon>
              إعادة تعيين
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <!-- Action Buttons -->
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div class="d-flex gap-2">
          <v-btn color="success" prepend-icon="mdi-file-excel" @click="exportToExcel" variant="tonal">
            Excel
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-file-pdf-box" @click="exportToPDF" variant="tonal">
            PDF
          </v-btn>
        </div>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          إضافة موظف
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :loading="loading"
        loading-text="جاري التحميل..."
        no-data-text="لا توجد بيانات"
        items-per-page="10"
        class="elevation-0"
      >
        <!-- Photo Column -->
        <template #item.photo_url="{ item }">
          <v-avatar size="40" class="my-2">
            <v-img v-if="item.photo_url" :src="getPhotoUrl(item.photo_url)" cover />
            <v-icon v-else color="grey">mdi-account</v-icon>
          </v-avatar>
        </template>

        <!-- Status Column -->
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
            {{ item.is_active ? 'نشط' : 'غير نشط' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="تعديل">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  v-bind="props"
                  @click="openEditDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="سجل النشاطات">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-history"
                  size="small"
                  variant="text"
                  color="info"
                  v-bind="props"
                  @click="openActivityLog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="طباعة البطاقة">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-card-account-details"
                  size="small"
                  variant="text"
                  color="purple"
                  v-bind="props"
                  @click="printCard(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="مزامنة مع الأجهزة">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-sync"
                  size="small"
                  variant="text"
                  color="teal"
                  v-bind="props"
                  @click="openSyncDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.is_active ? 'تعطيل' : 'تفعيل'">
              <template #activator="{ props }">
                <v-btn
                  :icon="item.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
                  size="small"
                  variant="text"
                  :color="item.is_active ? 'warning' : 'success'"
                  v-bind="props"
                  @click="toggleActivation(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="حذف">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  v-bind="props"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Employee Dialog -->
    <EmployeeDialog
      v-model="dialogOpen"
      :employee="selectedEmployee"
      @saved="onEmployeeSaved"
    />

    <!-- Activity Log Dialog -->
    <v-dialog v-model="activityLogDialog" max-width="900">
      <v-card>
        <v-card-title class="bg-info text-white">
          <v-icon start>mdi-history</v-icon>
          سجل نشاطات الموظف - {{ selectedEmployee?.name }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-data-table
            :headers="activityHeaders"
            :items="activityLogs"
            :loading="loadingActivity"
            loading-text="جاري التحميل..."
            no-data-text="لا توجد نشاطات مسجلة"
            items-per-page="10"
            density="compact"
          >
            <template #item.timestamp="{ item }">
              {{ formatDate(item.timestamp) }}
            </template>
            <template #item.access_type="{ item }">
              <v-chip :color="item.access_type === 'entry' ? 'success' : 'warning'" size="small">
                {{ item.access_type === 'entry' ? 'دخول' : 'خروج' }}
              </v-chip>
            </template>
            <template #item.status="{ item }">
              <v-chip :color="item.status === 'granted' ? 'success' : 'error'" size="small">
                {{ item.status === 'granted' ? 'مسموح' : 'مرفوض' }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="activityLogDialog = false">
            إغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Print Card Dialog -->
    <v-dialog v-model="printCardDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-purple text-white">
          <v-icon start>mdi-card-account-details</v-icon>
          بطاقة الموظف
        </v-card-title>
        <v-card-text class="pa-6">
          <div id="employee-card" class="employee-card text-center">
            <div class="card-header mb-4">
              <h2>بطاقة موظف</h2>
              <p class="text-caption">{{ selectedEmployee?.organization_name }}</p>
            </div>
            
            <v-avatar size="120" class="mb-4" style="border: 3px solid #1976d2">
              <v-img v-if="selectedEmployee?.photo_url" :src="getPhotoUrl(selectedEmployee.photo_url)" />
              <v-icon v-else size="80" color="grey">mdi-account</v-icon>
            </v-avatar>

            <div class="card-info">
              <h3 class="mb-2">{{ selectedEmployee?.name }}</h3>
              <div class="text-body-1 mb-2">
                <strong>رقم الموظف:</strong> {{ selectedEmployee?.employee_no }}
              </div>
              <div class="text-body-2 mb-1">
                <strong>القسم:</strong> {{ selectedEmployee?.department || 'غير محدد' }}
              </div>
              <div class="text-body-2 mb-1">
                <strong>المنصب:</strong> {{ selectedEmployee?.position || 'غير محدد' }}
              </div>
              <div class="text-body-2 mb-1">
                <strong>الهاتف:</strong> {{ selectedEmployee?.phone || 'غير محدد' }}
              </div>
            </div>

            <div class="mt-4">
              <v-chip color="success" v-if="selectedEmployee?.is_active">نشط</v-chip>
              <v-chip color="error" v-else>غير نشط</v-chip>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="printCardDialog = false">
            إلغاء
          </v-btn>
          <v-btn color="purple" variant="elevated" @click="printEmployeeCard">
            <v-icon start>mdi-printer</v-icon>
            طباعة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sync to Devices Dialog -->
    <v-dialog v-model="syncDialog" max-width="700">
      <v-card>
        <v-card-title class="bg-teal text-white">
          <v-icon start>mdi-sync</v-icon>
          مزامنة الموظف مع الأجهزة - {{ selectedEmployee?.name }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert type="info" variant="tonal" class="mb-4">
            اختر الأجهزة التي تريد مزامنة بيانات الموظف معها
          </v-alert>

          <v-list>
            <v-list-item
              v-for="device in devices"
              :key="device.id"
              :value="device.id"
            >
              <template #prepend>
                <v-checkbox
                  v-model="selectedDevices"
                  :value="device.id"
                  hide-details
                />
              </template>
              <v-list-item-title>
                {{ device.name }}
                <v-chip 
                  size="x-small" 
                  :color="device.is_online ? 'success' : 'error'" 
                  class="ml-2"
                >
                  {{ device.is_online ? 'متصل' : 'غير متصل' }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ device.ip_address }} - {{ device.location }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-progress-linear
            v-if="syncing"
            indeterminate
            color="teal"
            class="mt-4"
          />

          <v-alert
            v-if="syncResults.length > 0"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            <div v-for="result in syncResults" :key="result.device_id">
              ✓ {{ result.device_name }}: {{ result.message }}
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="grey" 
            variant="text" 
            @click="syncDialog = false"
            :disabled="syncing"
          >
            إلغاء
          </v-btn>
          <v-btn 
            color="teal" 
            variant="elevated" 
            @click="syncToDevices"
            :loading="syncing"
            :disabled="selectedDevices.length === 0 || syncing"
          >
            <v-icon start>mdi-sync</v-icon>
            مزامنة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          تأكيد الحذف
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert type="warning" variant="tonal" class="mb-4">
            هل أنت متأكد من حذف الموظف <strong>{{ employeeToDelete?.name }}</strong>؟
            <br />
            <span class="text-caption">هذا الإجراء لا يمكن التراجع عنه!</span>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false" :disabled="deleting">
            إلغاء
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteEmployee" :loading="deleting">
            <v-icon start>mdi-delete</v-icon>
            حذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
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
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import EmployeeDialog from '@/components/dialogs/EmployeeDialog.vue'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const search = ref('')
const loading = ref(true)
const employees = ref([])
const dialogOpen = ref(false)
const selectedEmployee = ref(null)
const deleteDialog = ref(false)
const employeeToDelete = ref(null)
const deleting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Statistics
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  departments: 0
})

// Filters
const filters = ref({
  search: '',
  organization_id: null,
  department: null,
  status: null
})

const organizations = ref([])
const departments = ref([])

const statusOptions = [
  { text: 'نشط', value: true },
  { text: 'غير نشط', value: false }
]

// Activity Log
const activityLogDialog = ref(false)
const activityLogs = ref([])
const loadingActivity = ref(false)

const activityHeaders = [
  { title: 'التاريخ والوقت', key: 'timestamp' },
  { title: 'الجهاز', key: 'device_name' },
  { title: 'النوع', key: 'access_type' },
  { title: 'الحالة', key: 'status' },
  { title: 'الموقع', key: 'location' }
]

// Print Card
const printCardDialog = ref(false)

// Sync to Devices
const syncDialog = ref(false)
const devices = ref([])
const selectedDevices = ref([])
const syncing = ref(false)
const syncResults = ref([])

const headers = [
  { title: 'الصورة', key: 'photo_url', sortable: false, align: 'center' },
  { title: 'رقم الموظف', key: 'employee_no', align: 'start' },
  { title: 'الاسم', key: 'name' },
  { title: 'المنظمة', key: 'organization_name' },
  { title: 'القسم', key: 'department' },
  { title: 'المنصب', key: 'position' },
  { title: 'البريد الإلكتروني', key: 'email' },
  { title: 'الهاتف', key: 'phone' },
  { title: 'الحالة', key: 'is_active', align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]

// Computed filtered employees
const filteredEmployees = computed(() => {
  let result = employees.value

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(emp => 
      emp.name?.toLowerCase().includes(searchLower) ||
      emp.employee_no?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.phone?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.value.organization_id) {
    result = result.filter(emp => emp.organization_id === filters.value.organization_id)
  }

  if (filters.value.department) {
    result = result.filter(emp => emp.department === filters.value.department)
  }

  if (filters.value.status !== null && filters.value.status !== undefined) {
    result = result.filter(emp => emp.is_active === filters.value.status)
  }

  return result
})

// Load employees
const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/employees')
    employees.value = response.data.data.employees || []
    calculateStats()
  } catch (error) {
    console.error('Error loading employees:', error)
    employees.value = []
    showSnackbar('حدث خطأ أثناء تحميل البيانات', 'error')
  } finally {
    loading.value = false
  }
}

// Load organizations
const loadOrganizations = async () => {
  try {
    const response = await axios.get('/api/organizations')
    organizations.value = response.data.data.organizations || []
  } catch (error) {
    console.error('Error loading organizations:', error)
  }
}

// Load departments
const loadDepartments = async () => {
  try {
    const response = await axios.get('/api/employees/departments/list')
    departments.value = response.data.data.departments || []
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

// Calculate statistics
const calculateStats = () => {
  stats.value.total = employees.value.length
  stats.value.active = employees.value.filter(e => e.is_active).length
  stats.value.inactive = employees.value.filter(e => !e.is_active).length
  
  const uniqueDepts = new Set(employees.value.map(e => e.department).filter(Boolean))
  stats.value.departments = uniqueDepts.size
}

// Apply filters
const applyFilters = () => {
  // Filters are applied automatically via computed property
  showSnackbar('تم تطبيق الفلاتر', 'info')
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    search: '',
    organization_id: null,
    department: null,
    status: null
  }
  showSnackbar('تم إعادة تعيين الفلاتر', 'info')
}

// Export to Excel
const exportToExcel = () => {
  try {
    const csvContent = convertToCSV(filteredEmployees.value)
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    showSnackbar('تم التصدير إلى Excel بنجاح', 'success')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    showSnackbar('حدث خطأ أثناء التصدير', 'error')
  }
}

// Convert to CSV
const convertToCSV = (data) => {
  const headers = ['رقم الموظف', 'الاسم', 'المنظمة', 'القسم', 'المنصب', 'البريد الإلكتروني', 'الهاتف', 'الحالة']
  const rows = data.map(emp => [
    emp.employee_no,
    emp.name,
    emp.organization_name,
    emp.department || '',
    emp.position || '',
    emp.email || '',
    emp.phone || '',
    emp.is_active ? 'نشط' : 'غير نشط'
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// Export to PDF
const exportToPDF = () => {
  const printWindow = window.open('', '', 'width=800,height=600')
  
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>قائمة الموظفين</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; }
        h1 { text-align: center; color: #1976d2; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background-color: #1976d2; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .stats { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>قائمة الموظفين</h1>
      <div class="stats">
        <p>إجمالي الموظفين: ${stats.value.total} | النشطين: ${stats.value.active} | غير النشطين: ${stats.value.inactive}</p>
        <p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>رقم الموظف</th>
            <th>الاسم</th>
            <th>المنظمة</th>
            <th>القسم</th>
            <th>المنصب</th>
            <th>الهاتف</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${filteredEmployees.value.map(emp => `
            <tr>
              <td>${emp.employee_no}</td>
              <td>${emp.name}</td>
              <td>${emp.organization_name || ''}</td>
              <td>${emp.department || ''}</td>
              <td>${emp.position || ''}</td>
              <td>${emp.phone || ''}</td>
              <td>${emp.is_active ? 'نشط' : 'غير نشط'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
    showSnackbar('تم فتح نافذة الطباعة', 'success')
  }, 250)
}

// Format date
const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ar })
}

// Open activity log
const openActivityLog = async (employee) => {
  selectedEmployee.value = employee
  activityLogDialog.value = true
  loadingActivity.value = true
  
  try {
    // Mock data - replace with actual API call
    // const response = await axios.get(`/api/employees/${employee.id}/activity-logs`)
    // activityLogs.value = response.data.data.logs || []
    
    // Temporary mock data
    activityLogs.value = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        device_name: 'جهاز المدخل الرئيسي',
        access_type: 'entry',
        status: 'granted',
        location: 'المدخل الرئيسي'
      }
    ]
  } catch (error) {
    console.error('Error loading activity logs:', error)
    showSnackbar('حدث خطأ أثناء تحميل السجل', 'error')
  } finally {
    loadingActivity.value = false
  }
}

// Print employee card
const printCard = (employee) => {
  selectedEmployee.value = employee
  printCardDialog.value = true
}

const printEmployeeCard = () => {
  const cardContent = document.getElementById('employee-card')
  const printWindow = window.open('', '', 'width=600,height=800')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>بطاقة موظف - ${selectedEmployee.value.name}</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: center; padding: 20px; }
        .employee-card { border: 2px solid #1976d2; border-radius: 10px; padding: 20px; max-width: 400px; margin: 0 auto; }
        .card-header h2 { color: #1976d2; margin: 0; }
        img { width: 120px; height: 120px; border-radius: 50%; border: 3px solid #1976d2; }
        .card-info { margin-top: 20px; }
      </style>
    </head>
    <body>
      ${cardContent.innerHTML}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

// Open sync dialog
const openSyncDialog = async (employee) => {
  selectedEmployee.value = employee
  syncDialog.value = true
  selectedDevices.value = []
  syncResults.value = []
  
  try {
    const response = await axios.get('/api/devices')
    devices.value = response.data.data.devices || []
  } catch (error) {
    console.error('Error loading devices:', error)
    showSnackbar('حدث خطأ أثناء تحميل الأجهزة', 'error')
  }
}

// Sync to devices
const syncToDevices = async () => {
  if (selectedDevices.value.length === 0) return
  
  syncing.value = true
  syncResults.value = []
  
  try {
    for (const deviceId of selectedDevices.value) {
      const device = devices.value.find(d => d.id === deviceId)
      
      try {
        await axios.post(`/api/devices/${deviceId}/sync`, {
          employee_ids: [selectedEmployee.value.id]
        })
        
        syncResults.value.push({
          device_id: deviceId,
          device_name: device.name,
          success: true,
          message: 'تمت المزامنة بنجاح'
        })
      } catch (error) {
        syncResults.value.push({
          device_id: deviceId,
          device_name: device.name,
          success: false,
          message: error.response?.data?.message || 'فشلت المزامنة'
        })
      }
    }
    
    showSnackbar('تمت المزامنة مع الأجهزة المحددة', 'success')
  } catch (error) {
    console.error('Error syncing to devices:', error)
    showSnackbar('حدث خطأ أثناء المزامنة', 'error')
  } finally {
    syncing.value = false
  }
}

// Open add dialog
const openAddDialog = () => {
  selectedEmployee.value = null
  dialogOpen.value = true
}

// Open edit dialog
const openEditDialog = (employee) => {
  selectedEmployee.value = { ...employee }
  dialogOpen.value = true
}

// On employee saved
const onEmployeeSaved = () => {
  loadEmployees()
  showSnackbar(selectedEmployee.value ? 'تم تحديث الموظف بنجاح' : 'تمت إضافة الموظف بنجاح', 'success')
}

// Toggle activation
const toggleActivation = async (employee) => {
  try {
    const endpoint = employee.is_active ? 'deactivate' : 'activate'
    await axios.post(`/api/employees/${employee.id}/${endpoint}`)
    await loadEmployees()
    showSnackbar(`تم ${employee.is_active ? 'تعطيل' : 'تفعيل'} الموظف بنجاح`, 'success')
  } catch (error) {
    console.error('Error toggling activation:', error)
    showSnackbar('حدث خطأ أثناء تغيير الحالة', 'error')
  }
}

// Confirm delete
const confirmDelete = (employee) => {
  employeeToDelete.value = employee
  deleteDialog.value = true
}

// Delete employee
const deleteEmployee = async () => {
  if (!employeeToDelete.value) return

  deleting.value = true
  try {
    await axios.delete(`/api/employees/${employeeToDelete.value.id}`)
    
    // إزالة الموظف من القائمة مباشرة (Optimistic Update)
    const index = employees.value.findIndex(e => e.id === employeeToDelete.value.id)
    if (index > -1) {
      employees.value.splice(index, 1)
    }
    
    // إعادة حساب الإحصائيات
    calculateStats()
    
    deleteDialog.value = false
    employeeToDelete.value = null
    showSnackbar('تم حذف الموظف بنجاح', 'success')
    
    // إعادة تحميل البيانات من السيرفر للتأكد
    await loadEmployees()
  } catch (error) {
    console.error('Error deleting employee:', error)
    showSnackbar('حدث خطأ أثناء حذف الموظف', 'error')
    // إعادة تحميل البيانات في حالة الخطأ
    await loadEmployees()
  } finally {
    deleting.value = false
  }
}

// Show snackbar
const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Convert photo URL to absolute path
const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null
  // If already absolute URL, return as is
  if (photoUrl.startsWith('http')) return photoUrl
  // Convert relative path to absolute URL
  return `http://localhost:3000${photoUrl}`
}

onMounted(() => {
  loadEmployees()
  loadOrganizations()
  loadDepartments()
})
</script>

<style scoped>
.employee-card {
  border: 2px solid #1976d2;
  border-radius: 10px;
  padding: 20px;
  background: white;
}

.card-header h2 {
  color: #1976d2;
  margin: 0;
}

.card-info {
  margin-top: 20px;
  text-align: center;
}

@media print {
  body * {
    visibility: hidden;
  }
  
  #employee-card,
  #employee-card * {
    visibility: visible;
  }
  
  #employee-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>