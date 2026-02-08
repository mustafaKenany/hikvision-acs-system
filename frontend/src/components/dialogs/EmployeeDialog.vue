<template>
  <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <span class="text-h5">{{ isEdit ? 'تعديل موظف' : 'إضافة موظف جديد' }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-6">
        <v-form ref="formRef" v-model="valid">
          <v-row>
            <!-- Employee Photo Section -->
            <v-col cols="12" md="4" class="text-center">
              <div class="mb-4">
                <v-avatar
                  size="180"
                  class="mb-4"
                  style="border: 3px solid #1976d2"
                >
                  <v-img
                    v-if="photoPreview || form.photo_url"
                    :src="photoPreview || form.photo_url"
                    cover
                  />
                  <v-icon v-else size="100" color="grey">mdi-account</v-icon>
                </v-avatar>

                <div>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-camera"
                    size="small"
                    @click="$refs.photoInput.click()"
                    block
                  >
                    {{ photoPreview ? 'تغيير الصورة' : 'رفع صورة' }}
                  </v-btn>
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handlePhotoUpload"
                  />

                  <v-btn
                    v-if="photoPreview || form.photo_url"
                    color="error"
                    variant="text"
                    size="small"
                    @click="removePhoto"
                    block
                    class="mt-2"
                  >
                    حذف الصورة
                  </v-btn>
                </div>
              </div>

              <v-alert
                v-if="isEdit && form.biometrics_status"
                type="info"
                variant="tonal"
                density="compact"
                class="text-start"
              >
                <div class="text-caption">
                  <div><strong>البيانات البيومترية:</strong></div>
                  <div>🔹 الوجه: {{ form.biometrics_status.face ? '✓' : '✗' }}</div>
                  <div>🔹 البصمة: {{ form.biometrics_status.fingerprint ? '✓' : '✗' }}</div>
                  <div v-if="form.biometrics_status.card_no">🔹 الكارت: {{ form.biometrics_status.card_no }}</div>
                </div>
              </v-alert>
            </v-col>

            <!-- Employee Information Form -->
            <v-col cols="12" md="8">
              <v-row>
                <!-- Employee Number -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_no"
                    label="رقم الموظف *"
                    prepend-inner-icon="mdi-numeric"
                    variant="outlined"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>

                <!-- Full Name -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.name"
                    label="الاسم الكامل *"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>

                <!-- Organization -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.organization_id"
                    label="المنظمة *"
                    prepend-inner-icon="mdi-office-building"
                    variant="outlined"
                    :items="organizations"
                    item-title="name"
                    item-value="id"
                    :rules="[rules.required]"
                    :loading="loadingOrgs"
                    required
                  />
                </v-col>

                <!-- Department -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.department"
                    label="القسم"
                    prepend-inner-icon="mdi-domain"
                    variant="outlined"
                  />
                </v-col>

                <!-- Position -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.position"
                    label="المنصب"
                    prepend-inner-icon="mdi-briefcase"
                    variant="outlined"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="البريد الإلكتروني"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    type="email"
                    :rules="[rules.email]"
                  />
                </v-col>

                <!-- Phone -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone"
                    label="رقم الهاتف"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                  />
                </v-col>

                <!-- Hire Date -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.hire_date"
                    label="تاريخ التوظيف"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    type="date"
                  />
                </v-col>

                <!-- Active Status -->
                <v-col cols="12">
                  <v-switch
                    v-model="form.is_active"
                    label="الحالة: نشط"
                    color="primary"
                    hide-details
                  />
                </v-col>

                <!-- Notes -->
                <v-col cols="12">
                  <v-textarea
                    v-model="form.notes"
                    label="ملاحظات"
                    prepend-inner-icon="mdi-text"
                    variant="outlined"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
          :disabled="saving"
        >
          إلغاء
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveEmployee"
          :loading="saving"
          :disabled="!valid || saving"
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ isEdit ? 'حفظ التعديلات' : 'إضافة' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from '@/api/axios'

const props = defineProps({
  modelValue: Boolean,
  employee: Object
})

const emit = defineEmits(['update:modelValue', 'saved'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const valid = ref(false)
const saving = ref(false)
const loadingOrgs = ref(false)
const organizations = ref([])
const photoInput = ref(null)
const photoPreview = ref(null)
const photoFile = ref(null)

const isEdit = computed(() => !!props.employee?.id)

const form = ref({
  employee_no: '',
  name: '',
  organization_id: null,
  department: '',
  position: '',
  email: '',
  phone: '',
  hire_date: '',
  is_active: true,
  notes: '',
  photo_url: null,
  biometrics_status: null
})

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  email: v => !v || /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صحيح'
}

// Load organizations
const loadOrganizations = async () => {
  loadingOrgs.value = true
  try {
    const response = await axios.get('/api/organizations')
    organizations.value = response.data.data.organizations || []
  } catch (error) {
    console.error('Error loading organizations:', error)
  } finally {
    loadingOrgs.value = false
  }
}

// Handle photo upload
const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Remove photo
const removePhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  form.value.photo_url = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

// Save employee
const saveEmployee = async () => {
  const { valid: isValid } = await formRef.value.validate()
  if (!isValid) return

  saving.value = true
  try {
    let response
    if (isEdit.value) {
      // Update existing employee
      response = await axios.put(`/api/employees/${props.employee.id}`, form.value)
    } else {
      // Create new employee
      response = await axios.post('/api/employees', form.value)
    }

    const savedEmployee = response.data.data

    // Upload photo if exists
    if (photoFile.value && savedEmployee.id) {
      const formData = new FormData()
      formData.append('photo', photoFile.value)
      await axios.post(`/api/employees/${savedEmployee.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    emit('saved', savedEmployee)
    closeDialog()
  } catch (error) {
    console.error('Error saving employee:', error)
    alert(error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات')
  } finally {
    saving.value = false
  }
}

// Close dialog
const closeDialog = () => {
  dialog.value = false
  formRef.value?.reset()
  removePhoto()
}

// Watch for employee changes
watch(() => props.employee, (newEmployee) => {
  if (newEmployee) {
    form.value = {
      employee_no: newEmployee.employee_no || '',
      name: newEmployee.name || '',
      organization_id: newEmployee.organization_id || null,
      department: newEmployee.department || '',
      position: newEmployee.position || '',
      email: newEmployee.email || '',
      phone: newEmployee.phone || '',
      hire_date: newEmployee.hire_date ? newEmployee.hire_date.split('T')[0] : '',
      is_active: newEmployee.is_active ?? true,
      notes: newEmployee.notes || '',
      photo_url: newEmployee.photo_url || null,
      biometrics_status: newEmployee.biometrics_status || null
    }
    photoPreview.value = null
    photoFile.value = null
  }
}, { immediate: true })

// Watch dialog open
watch(dialog, (isOpen) => {
  if (isOpen) {
    loadOrganizations()
    if (!props.employee) {
      form.value = {
        employee_no: '',
        name: '',
        organization_id: null,
        department: '',
        position: '',
        email: '',
        phone: '',
        hire_date: '',
        is_active: true,
        notes: '',
        photo_url: null,
        biometrics_status: null
      }
      removePhoto()
    }
  }
})
</script>
