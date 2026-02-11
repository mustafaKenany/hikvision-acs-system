<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="900" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-office-building</v-icon>
        {{ isEditMode ? 'تعديل منظمة' : 'إضافة منظمة جديدة' }}
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="save">
          <v-row>
            <!-- Logo Upload -->
            <v-col cols="12" class="text-center">
              <v-avatar size="120" class="mb-2" style="cursor: pointer" @click="$refs.logoInput.click()">
                <v-img v-if="logoPreview || formData.logo_url" :src="logoPreview || getLogoUrl(formData.logo_url)" cover />
                <v-icon v-else size="80" color="grey">mdi-office-building</v-icon>
              </v-avatar>
              <input
                ref="logoInput"
                type="file"
                accept="image/png"
                style="display: none"
                @change="onLogoSelected"
              />
              <div class="text-caption text-grey">
                اضغط لتحميل الشعار (PNG فقط، 300x300)
              </div>
              <v-btn
                v-if="logoFile || formData.logo_url"
                size="small"
                color="error"
                variant="text"
                class="mt-2"
                @click="removeLogo"
              >
                <v-icon start>mdi-delete</v-icon>
                إزالة الشعار
              </v-btn>
            </v-col>

            <!-- Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="اسم المنظمة *"
                prepend-inner-icon="mdi-office-building"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="البريد الإلكتروني *"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                type="email"
                :rules="[rules.required, rules.email]"
                required
              />
            </v-col>

            <!-- Phone -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phone"
                label="الهاتف"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
              />
            </v-col>

            <!-- Address -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.address"
                label="العنوان"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
              />
            </v-col>

            <!-- Subscription Plan -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.subscription_plan"
                label="خطة الاشتراك *"
                prepend-inner-icon="mdi-crown"
                variant="outlined"
                :items="subscriptionPlans"
                item-title="text"
                item-value="value"
                :rules="[rules.required]"
                required
                @update:model-value="updateLimits"
              />
            </v-col>

            <!-- Subscription Start -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.subscription_start"
                label="بداية الاشتراك"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                type="date"
              />
            </v-col>

            <!-- Subscription End -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.subscription_end"
                label="نهاية الاشتراك"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                type="date"
              />
            </v-col>

            <!-- Max Employees -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.max_employees"
                label="الحد الأقصى للموظفين *"
                prepend-inner-icon="mdi-account-group"
                variant="outlined"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
              />
            </v-col>

            <!-- Max Devices -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.max_devices"
                label="الحد الأقصى للأجهزة *"
                prepend-inner-icon="mdi-devices"
                variant="outlined"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
              />
            </v-col>

            <!-- Storage Limit -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.storage_limit_mb"
                label="مساحة التخزين (MB) *"
                prepend-inner-icon="mdi-harddisk"
                variant="outlined"
                type="number"
                :rules="[rules.required, rules.positive]"
                required
              />
            </v-col>

            <!-- Active Status -->
            <v-col cols="12">
              <v-switch
                v-model="formData.is_active"
                label="نشطة"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="close" :disabled="saving">
          إلغاء
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="save" :loading="saving">
          <v-icon start>mdi-content-save</v-icon>
          {{ isEditMode ? 'تحديث' : 'حفظ' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'

const props = defineProps({
  modelValue: Boolean,
  organization: Object
})

const emit = defineEmits(['update:modelValue', 'saved'])

const form = ref(null)
const saving = ref(false)
const logoFile = ref(null)
const logoPreview = ref(null)
const logoInput = ref(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  subscription_plan: 'free',
  subscription_start: null,
  subscription_end: null,
  max_employees: 10,
  max_devices: 5,
  storage_limit_mb: 100,
  is_active: true,
  logo_url: null
})

const subscriptionPlans = [
  { text: 'مجاني', value: 'free' },
  { text: 'أساسي', value: 'basic' },
  { text: 'احترافي', value: 'pro' },
  { text: 'مؤسسي', value: 'enterprise' }
]

const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'بريد إلكتروني غير صالح'
  },
  positive: value => value > 0 || 'يجب أن تكون القيمة أكبر من صفر'
}

const isEditMode = computed(() => !!props.organization?.id)

// Update limits based on subscription plan
const updateLimits = (plan) => {
  const limits = {
    free: { employees: 10, devices: 5, storage: 100 },
    basic: { employees: 50, devices: 20, storage: 500 },
    pro: { employees: 200, devices: 50, storage: 2000 },
    enterprise: { employees: 1000, devices: 200, storage: 10000 }
  }
  
  const selected = limits[plan] || limits.free
  formData.value.max_employees = selected.employees
  formData.value.max_devices = selected.devices
  formData.value.storage_limit_mb = selected.storage
}

// Reset form
const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    subscription_plan: 'free',
    subscription_start: null,
    subscription_end: null,
    max_employees: 10,
    max_devices: 5,
    storage_limit_mb: 100,
    is_active: true,
    logo_url: null
  }
  logoPreview.value = null
  logoFile.value = null
  form.value?.resetValidation()
}

// Watch for organization changes
watch(() => props.organization, (newVal) => {
  if (newVal) {
    formData.value = {
      ...newVal,
      subscription_start: newVal.subscription_start?.split('T')[0] || null,
      subscription_end: newVal.subscription_end?.split('T')[0] || null
    }
    logoPreview.value = null
    logoFile.value = null
  } else {
    resetForm()
  }
}, { immediate: true })

// Handle logo selection
const onLogoSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (file.type !== 'image/png') {
    alert('الرجاء اختيار ملف PNG فقط')
    return
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('حجم الملف يجب أن يكون أقل من 2 ميجابايت')
    return
  }

  logoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove logo
const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  formData.value.logo_url = null
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

// Get logo URL
const getLogoUrl = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `http://localhost:3000${logoUrl}`
}

// Save organization
const save = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // Clean data before sending
    const dataToSend = {
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone || null,
      address: formData.value.address || null,
      subscription_plan: formData.value.subscription_plan,
      subscription_start: formData.value.subscription_start || null,
      subscription_end: formData.value.subscription_end || null,
      max_employees: parseInt(formData.value.max_employees) || 10,
      max_devices: parseInt(formData.value.max_devices) || 5,
      storage_limit_mb: parseInt(formData.value.storage_limit_mb) || 100,
      is_active: formData.value.is_active
    }

    console.log('📤 Sending organization data:', dataToSend)

    let savedOrganization

    if (isEditMode.value) {
      // Update existing organization
      const response = await axios.put(`/organizations/${props.organization.id}`, dataToSend)
      savedOrganization = response.data.data
    } else {
      // Create new organization
      const response = await axios.post('/organizations', dataToSend)
      savedOrganization = response.data.data
    }

    console.log('✅ Organization saved:', savedOrganization)

    // Upload logo if selected
    if (logoFile.value && savedOrganization.id) {
      const logoFormData = new FormData()
      logoFormData.append('logo', logoFile.value)
      
      try {
        await axios.post(`/api/organizations/${savedOrganization.id}/logo`, logoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        console.log('✅ Logo uploaded')
      } catch (logoError) {
        console.error('Error uploading logo:', logoError)
        // Continue even if logo upload fails
      }
    }

    emit('saved')
    close()
  } catch (error) {
    console.error('❌ Error saving organization:', error)
    console.error('❌ Error response:', error.response?.data)
    console.error('❌ Error details:', error.response?.data?.details)
    console.error('❌ Error errors:', error.response?.data?.errors)
    
    let errorMsg = 'حدث خطأ أثناء حفظ البيانات'
    
    if (error.response?.data?.details) {
      errorMsg = error.response.data.details.map(d => `${d.field}: ${d.message}`).join('\n')
    } else if (error.response?.data?.errors) {
      errorMsg = error.response.data.errors.map(e => e.msg || e.message).join('\n')
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMsg = error.response.data.error
    }
    
    alert(errorMsg)
  } finally {
    saving.value = false
  }
}

// Close dialog
const close = () => {
  resetForm()
  emit('update:modelValue', false)
}
</script>

<style scoped>
.v-avatar {
  border: 2px dashed #ccc;
  transition: border-color 0.3s;
}

.v-avatar:hover {
  border-color: #1976d2;
}
</style>
