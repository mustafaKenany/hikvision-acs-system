<!-- 
  Enhanced Employees Component with:
  - Bulk Selection & Actions
  - Improved Export (Excel & PDF)
  - QR Code in Print Card
  - Better UI/UX
-->
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
      <!-- Bulk Actions Toolbar -->
      <v-slide-y-transition>
        <v-toolbar v-if="selected.length > 0" color="primary" dark>
          <v-toolbar-title>
            <v-icon start>mdi-checkbox-marked-circle</v-icon>
            تم تحديد {{ selected.length }} موظف
          </v-toolbar-title>
          
          <v-spacer />
          
          <v-btn icon="mdi-check-all" @click="bulkActivate" title="تفعيل الكل">
            <v-icon>mdi-check-all</v-icon>
          </v-btn>
          
          <v-btn icon="mdi-cancel" @click="bulkDeactivate" title="إلغاء تفعيل الكل">
            <v-icon>mdi-cancel</v-icon>
          </v-btn>
          
          <v-btn icon="mdi-file-excel" @click="exportSelected" title="تصدير">
            <v-icon>mdi-file-excel</v-icon>
          </v-btn>
          
          <v-btn icon="mdi-printer" @click="printSelectedCards" title="طباعة الكروت">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
          
          <v-btn icon="mdi-delete" @click="bulkDelete" title="حذف">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          
          <v-btn icon="mdi-close" @click="selected = []" title="إلغاء التحديد">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-slide-y-transition>

      <!-- Filters Section -->
      <v-card-title class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              prepend-inner-icon="mdi-magnify"
              label="بحث (الاسم، الرقم، الهاتف...)"
              variant="outlined"
              density="compact"
              hide-details
              clearable
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

          <v-col cols="12" md="4" class="d-flex gap-2 align-center">
            <v-btn color="success" prepend-icon="mdi-file-excel" @click="handleExportExcel" variant="tonal" size="small">
              Excel
            </v-btn>
            <v-btn color="error" prepend-icon="mdi-file-pdf-box" @click="handleExportPDF" variant="tonal" size="small">
              PDF
            </v-btn>
            <v-spacer />
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
              إضافة موظف
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-divider />

      <!-- Data Table -->
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="filteredEmployees"
        :loading="loading"
        loading-text="جاري التحميل..."
        no-data-text="لا توجد بيانات"
        items-per-page="15"
        show-select
        class="elevation-0"
        item-value="id"
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
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditDialog(item)"
            />
            
            <v-btn
              icon="mdi-card-account-details"
              size="small"
              variant="text"
              color="purple"
              @click="printCard(item)"
            />

            <v-btn
              :icon="item.is_active ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
              size="small"
              variant="text"
              :color="item.is_active ? 'warning' : 'success'"
              @click="toggleActivation(item)"
            />

            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
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

    <!-- Print Card Dialog with QR Code -->
    <v-dialog v-model="printCardDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-purple text-white">
          <v-icon start>mdi-card-account-details</v-icon>
          بطاقة الموظف
        </v-card-title>
        <v-card-text class="pa-6">
          <div v-if="selectedEmployee" ref="cardContent" class="text-center">
            <!-- QR Code - Large and Centered -->
            <div class="mb-4">
              <qrcode-vue
                v-if="qrCodeData"
                :value="qrCodeData"
                :size="220"
                level="H"
                class="mx-auto"
                style="border: 3px solid #9C27B0; padding: 10px; background: white;"
              />
            </div>

            <!-- Employee Photo - Below QR Code -->
            <div>
              <v-avatar size="160" style="border: 3px solid #1976d2">
                <v-img v-if="selectedEmployee.photo_url" :src="getPhotoUrl(selectedEmployee.photo_url)" />
                <v-icon v-else size="100" color="grey">mdi-account</v-icon>
              </v-avatar>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn 
            color="info" 
            variant="text" 
            size="small"
            @click="showQRDataDialog = true"
          >
            <v-icon start size="small">mdi-code-json</v-icon>
            عرض البيانات
          </v-btn>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="printCardDialog = false">
            إلغاء
          </v-btn>
          <v-btn color="purple" variant="elevated" @click="handlePrintCard">
            <v-icon start>mdi-printer</v-icon>
            طباعة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- QR Data Viewer Dialog -->
    <v-dialog v-model="showQRDataDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-info text-white">
          <v-icon start>mdi-qrcode-scan</v-icon>
          محتوى QR Code
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert type="success" variant="tonal" class="mb-3">
            <div class="text-caption">
              ✅ هذا الكود يمكن قراءته من أي تطبيق QR Scanner على الموبايل
            </div>
          </v-alert>
          <pre class="text-caption pa-3" style="background: #f5f5f5; border-radius: 4px; overflow-x: auto;">{{ qrCodeData }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showQRDataDialog = false">حسناً</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon start>mdi-alert</v-icon>
          تأكيد الحذف
        </v-card-title>
        <v-card-text class="pa-6">
          <p v-if="bulkDeleteMode">
            هل أنت متأكد من حذف {{ employeesToDelete.length }} موظف؟
            <br/>
            <strong class="text-error">لا يمكن التراجع عن هذا الإجراء!</strong>
          </p>
          <p v-else-if="employeeToDelete">
            هل أنت متأكد من حذف الموظف <strong>"{{ employeeToDelete.name }}"</strong>؟
            <br/>
            <strong class="text-error">لا يمكن التراجع عن هذا الإجراء!</strong>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false" :disabled="deleting">
            إلغاء
          </v-btn>
          <v-btn color="error" variant="elevated" @click="executeDelete" :loading="deleting">
            <v-icon start>mdi-delete</v-icon>
            حذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--  Success/Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/api/axios'
import EmployeeDialog from '@/components/dialogs/EmployeeDialog.vue'
import QrcodeVue from 'qrcode.vue'
import { exportToExcel, exportToPDF, printEmployeeCard } from '@/utils/exportUtils'

// State
const loading = ref(true)
const employees = ref([])
const selected = ref([])
const dialogOpen = ref(false)
const selectedEmployee = ref(null)
const printCardDialog = ref(false)
const deleteDialog = ref(false)
const employeeToDelete = ref(null)
const employeesToDelete = ref([])
const bulkDeleteMode = ref(false)
const deleting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const qrCodeData = ref(null)
const cardContent = ref(null)
const showQRDataDialog = ref(false)

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
  department: null,
  status: null
})

const departments = ref([])
const statusOptions = [
  { text: 'نشط', value: true },
  { text: 'غير نشط', value: false }
]

// Headers - مقللة للاستفادة من المساحة
const headers = [
  { title: 'الصورة', key: 'photo_url', sortable: false, align: 'center', width: '80px' },
  { title: 'رقم الموظف', key: 'employee_no', align: 'start', width: '120px' },
  { title: 'الاسم', key: 'name', width: '200px' },
  { title: 'القسم', key: 'department', width: '150px' },
  { title: 'الهاتف', key: 'phone', width: '130px' },
  { title: 'الحالة', key: 'is_active', align: 'center', width: '100px' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center', width: '180px' }
]

// Computed
const filteredEmployees = computed(() => {
  let result = employees.value

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(emp => 
      emp.name?.toLowerCase().includes(searchLower) ||
      emp.employee_no?.toLowerCase().includes(searchLower) ||
      emp.phone?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.value.department) {
    result = result.filter(emp => emp.department === filters.value.department)
  }

  if (filters.value.status !== null) {
    result = result.filter(emp => emp.is_active === filters.value.status)
  }

  return result
})

// Methods
const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await axios.get('/employees')
    employees.value = response.data.data.employees || []
    calculateStats()
  } catch (error) {
    console.error('Error loading employees:', error)
    showSnackbar('حدث خطأ أثناء تحميل البيانات', 'error')
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const response = await axios.get('/employees/departments/list')
    departments.value = response.data.data.departments || []
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

const calculateStats = () => {
  stats.value.total = employees.value.length
  stats.value.active = employees.value.filter(e => e.is_active).length
  stats.value.inactive = employees.value.filter(e => !e.is_active).length
  stats.value.departments = new Set(employees.value.map(e => e.department).filter(Boolean)).size
}

const openAddDialog = () => {
  selectedEmployee.value = null
  dialogOpen.value = true
}

const openEditDialog = (employee) => {
  selectedEmployee.value = { ...employee }
  dialogOpen.value = true
}

const onEmployeeSaved = (data) => {
  // عرض toast notification
  showSnackbar(data.message || 'تم الحفظ بنجاح!', 'success')
  // إعادة تحميل البيانات بعد ثانيتين (للانتظار حتى ينتهي cache invalidation)
  setTimeout(() => loadEmployees(), 2000)
}

const toggleActivation = async (employee) => {
  try {
    const endpoint = employee.is_active ? 'deactivate' : 'activate'
    await axios.post(`/employees/${employee.id}/${endpoint}`)
    
    const index = employees.value.findIndex(e => e.id === employee.id)
    if (index > -1) {
      employees.value[index].is_active = !employee.is_active
    }
    
    calculateStats()
    showSnackbar(`تم ${employee.is_active ? 'تعطيل' : 'تفعيل'} الموظف بنجاح`, 'success')
    
    setTimeout(() => loadEmployees(), 2000)
  } catch (error) {
    console.error('Error toggling activation:', error)
    showSnackbar('حدث خطأ أثناء تغيير الحالة', 'error')
  }
}

const confirmDelete = (employee) => {
  employeeToDelete.value = employee
  bulkDeleteMode.value = false
  deleteDialog.value = true
}

const executeDelete = async () => {
  deleting.value = true
  try {
    if (bulkDeleteMode.value) {
      // Bulk delete - employeesToDelete contains IDs (not objects)
      await Promise.all(
        employeesToDelete.value.map(empId => axios.delete(`/employees/${empId}`))
      )
      showSnackbar(`تم حذف ${employeesToDelete.value.length} موظف بنجاح`, 'success')
      selected.value = []
    } else {
      // Single delete
      await axios.delete(`/employees/${employeeToDelete.value.id}`)
      showSnackbar('تم حذف الموظف بنجاح', 'success')
    }
    
    deleteDialog.value = false
    await loadEmployees()
  } catch (error) {
    console.error('Error deleting employee:', error)
    showSnackbar('حدث خطأ أثناء الحذف', 'error')
  } finally {
    deleting.value = false
  }
}

// Bulk Actions
const bulkActivate = async () => {
  try {
    // selected.value contains IDs (not objects) because item-value="id"
    await Promise.all(
      selected.value.map(empId => axios.post(`/employees/${empId}/activate`))
    )
    showSnackbar(`تم تفعيل ${selected.value.length} موظف`, 'success')
    selected.value = []
    await loadEmployees()
  } catch (error) {
    showSnackbar('حدث خطأ في التفعيل الجماعي', 'error')
  }
}

const bulkDeactivate = async () => {
  try {
    // selected.value contains IDs (not objects) because item-value="id"
    await Promise.all(
      selected.value.map(empId => axios.post(`/employees/${empId}/deactivate`))
    )
    showSnackbar(`تم إلغاء تفعيل ${selected.value.length} موظف`, 'success')
    selected.value = []
    await loadEmployees()
  } catch (error) {
    showSnackbar('حدث خطأ في إلغاء التفعيل الجماعي', 'error')
  }
}

const bulkDelete = () => {
  employeesToDelete.value = selected.value
  bulkDeleteMode.value = true
  deleteDialog.value = true
}

const exportSelected = () => {
  // selected.value contains IDs, need to get full employee objects
  const selectedEmployees = employees.value.filter(emp => selected.value.includes(emp.id))
  const result = exportToExcel(selectedEmployees, 'selected_employees')
  showSnackbar(result.message, result.success ? 'success' : 'error')
  selected.value = []
}

const printSelectedCards = async () => {
  // selected.value contains IDs, need to get full employee objects
  const selectedEmployees = employees.value.filter(emp => selected.value.includes(emp.id))
  for (const emp of selectedEmployees) {
    await printCard(emp)
    await new Promise(resolve => setTimeout(resolve, 1000)) // تأخير بين كل طباعة
  }
  selected.value = []
}

// Export
const handleExportExcel = () => {
  const result = exportToExcel(filteredEmployees.value)
  showSnackbar(result.message, result.success ? 'success' : 'error')
}

const handleExportPDF = () => {
  const result = exportToPDF(filteredEmployees.value, stats.value)
  showSnackbar(result.message, result.success ? 'success' : 'error')
}

// Print Card
const printCard = (employee) => {
  selectedEmployee.value = employee
  // Generate QR Code data with comprehensive employee info
  const qrData = {
    // معلومات التعريف الأساسية
    id: employee.id,
    employee_no: employee.employee_no,
    name: employee.name,
    department: employee.department || 'N/A',
    phone: employee.phone || 'N/A',
    
    // معلومات النظام
    organization_id: employee.organization_id,
    is_active: employee.is_active,
    issued_at: new Date().toISOString().split('T')[0], // تاريخ بصيغة مبسطة
    
    // رابط التحقق
    verify_url: `${window.location.origin}/api/employees/${employee.id}/verify`
  }
  
  qrCodeData.value = JSON.stringify(qrData, null, 2)
  printCardDialog.value = true
}

const handlePrintCard = async () => {
  // Get QR Code as data URL
  const qrCanvas = document.querySelector('canvas')
  const qrDataUrl = qrCanvas ? qrCanvas.toDataURL() : null
  
  printEmployeeCard(selectedEmployee.value, qrDataUrl)
  printCardDialog.value = false
  showSnackbar('تم فتح نافذة الطباعة', 'success')
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const getPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null
  if (photoUrl.startsWith('http')) return photoUrl
  return `http://localhost:3000${photoUrl}`
}

// Lifecycle
onMounted(() => {
  loadEmployees()
  loadDepartments()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
