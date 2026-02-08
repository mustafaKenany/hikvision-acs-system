<template>
  <div>
    <h1 class="text-h4 mb-6">إدارة الموظفين</h1>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="بحث..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 400px"
        />

        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          إضافة موظف
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="employees"
        :loading="loading"
        :search="search"
        loading-text="جاري التحميل..."
        no-data-text="لا توجد بيانات"
        items-per-page="10"
        class="elevation-0"
      >
        <!-- Photo Column -->
        <template #item.photo_url="{ item }">
          <v-avatar size="40" class="my-2">
            <v-img v-if="item.photo_url" :src="item.photo_url" cover />
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
        </template>
      </v-data-table>
    </v-card>

    <!-- Employee Dialog -->
    <EmployeeDialog
      v-model="dialogOpen"
      :employee="selectedEmployee"
      @saved="onEmployeeSaved"
    />

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
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'
import EmployeeDialog from '@/components/dialogs/EmployeeDialog.vue'

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

// Load employees
const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/employees')
    employees.value = response.data.data.employees || []
  } catch (error) {
    console.error('Error loading employees:', error)
    employees.value = []
    showSnackbar('حدث خطأ أثناء تحميل البيانات', 'error')
  } finally {
    loading.value = false
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
    await loadEmployees()
    deleteDialog.value = false
    showSnackbar('تم حذف الموظف بنجاح', 'success')
  } catch (error) {
    console.error('Error deleting employee:', error)
    showSnackbar('حدث خطأ أثناء حذف الموظف', 'error')
  } finally {
    deleting.value = false
    employeeToDelete.value = null
  }
}

// Show snackbar
const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  loadEmployees()
})
</script>
