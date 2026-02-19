<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="900">
    <v-card>
      <v-card-title>
        إدارة الموظفين - {{ schedule?.name }}
      </v-card-title>

      <v-card-text>
        <!-- Assign Form -->
        <v-card variant="outlined" class="mb-4">
          <v-card-subtitle>تعيين موظفين جدد</v-card-subtitle>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="assignEmployees">
              <v-autocomplete
                v-model="selectedEmployees"
                :items="availableEmployees"
                :loading="loadingEmployees"
                item-title="name"
                item-value="id"
                label="اختر الموظفين *"
                multiple
                chips
                closable-chips
                outlined
                dense
                :rules="[v => v.length > 0 || 'يجب اختيار موظف واحد على الأقل']"
              >
                <template v-slot:chip="{ props, item }">
                  <v-chip v-bind="props" :text="item.raw.name" />
                </template>
              </v-autocomplete>

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="assignForm.effective_from"
                    label="تاريخ البداية *"
                    type="date"
                    :rules="[v => !!v || 'تاريخ البداية مطلوب']"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="assignForm.effective_until"
                    label="تاريخ النهاية (اختياري)"
                    type="date"
                    outlined
                    dense
                    clearable
                  />
                </v-col>
              </v-row>

              <v-btn color="primary" :loading="assigning" @click="assignEmployees">
                تعيين الموظفين
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Assigned Employees List -->
        <v-card variant="outlined">
          <v-card-subtitle>الموظفون المعينون</v-card-subtitle>
          <v-card-text>
            <!-- Search in assigned employees -->
            <v-text-field
              v-model="employeeSearch"
              prepend-inner-icon="mdi-magnify"
              label="بحث في الموظفين المعينين"
              clearable
              outlined
              dense
              hide-details
              class="mb-4"
            />

            <v-data-table
              :headers="headers"
              :items="assignedEmployees"
              :loading="loadingAssigned"
              :items-per-page="10"
              :search="employeeSearch"
            >
              <template v-slot:item.name="{ item }">
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-grey">{{ item.employee_no }}</div>
                </div>
              </template>

              <template v-slot:item.department="{ item }">
                {{ item.department || '-' }}
              </template>

              <template v-slot:item.effective_dates="{ item }">
                <div>
                  <div>من: {{ formatDate(item.EmployeeSchedule.effective_from) }}</div>
                  <div v-if="item.EmployeeSchedule.effective_until">
                    إلى: {{ formatDate(item.EmployeeSchedule.effective_until) }}
                  </div>
                </div>
              </template>

              <template v-slot:item.is_active="{ item }">
                <v-chip 
                  :color="item.EmployeeSchedule.is_active ? 'success' : 'error'" 
                  size="small"
                >
                  {{ item.EmployeeSchedule.is_active ? 'نشط' : 'غير نشط' }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error" 
                  @click="confirmUnassign(item)" 
                />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">إغلاق</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'
import { useSnackbar } from '@/composables/useSnackbar'
import { format, parseISO } from 'date-fns'

const props = defineProps({
  modelValue: Boolean,
  schedule: Object
})

const emit = defineEmits(['update:modelValue'])

const { showSuccess, showError } = useSnackbar()

const formRef = ref(null)
const selectedEmployees = ref([])
const availableEmployees = ref([])
const assignedEmployees = ref([])
const loadingEmployees = ref(false)
const loadingAssigned = ref(false)
const assigning = ref(false)
const employeeSearch = ref('')

const assignForm = ref({
  effective_from: format(new Date(), 'yyyy-MM-dd'),
  effective_until: null
})

const headers = [
  { title: 'الموظف', key: 'name' },
  { title: 'القسم', key: 'department' },
  { title: 'الفترة الفعلية', key: 'effective_dates' },
  { title: 'الحالة', key: 'is_active' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return format(parseISO(dateStr), 'dd/MM/yyyy')
}

const loadEmployees = async () => {
  loadingEmployees.value = true
  try {
    const response = await axios.get('/employees')
    availableEmployees.value = response.data.data.employees
  } catch (error) {
    showError('فشل تحميل الموظفين')
  } finally {
    loadingEmployees.value = false
  }
}

const loadAssignedEmployees = async () => {
  if (!props.schedule?.id) return
  
  loadingAssigned.value = true
  try {
    const response = await axios.get(`/work-schedules/${props.schedule.id}/employees`)
    assignedEmployees.value = response.data.data.employees
  } catch (error) {
    showError('فشل تحميل الموظفين المعينين')
  } finally {
    loadingAssigned.value = false
  }
}

const assignEmployees = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (selectedEmployees.value.length === 0) {
    showError('يجب اختيار موظف واحد على الأقل')
    return
  }

  assigning.value = true
  try {
    await axios.post(`/work-schedules/${props.schedule.id}/assign-employees`, {
      employee_ids: selectedEmployees.value,
      effective_from: assignForm.value.effective_from,
      effective_until: assignForm.value.effective_until || undefined
    })
    
    showSuccess('تم تعيين الموظفين بنجاح')
    selectedEmployees.value = []
    loadAssignedEmployees()
  } catch (error) {
    showError(error.response?.data?.message || 'فشل تعيين الموظفين')
  } finally {
    assigning.value = false
  }
}

const confirmUnassign = (employee) => {
  if (confirm(`هل أنت متأكد من إلغاء تعيين "${employee.name}"؟`)) {
    unassignEmployee(employee.id)
  }
}

const unassignEmployee = async (employeeId) => {
  try {
    // This would need a new backend endpoint - for now, we can update is_active
    await axios.delete(`/work-schedules/${props.schedule.id}/employees/${employeeId}`)
    showSuccess('تم إلغاء التعيين بنجاح')
    loadAssignedEmployees()
  } catch (error) {
    showError('فشل إلغاء التعيين')
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.schedule) {
    loadEmployees()
    loadAssignedEmployees()
  }
})
</script>
