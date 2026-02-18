<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="bg-success text-white">
        <v-icon start>mdi-face-recognition</v-icon>
        تسجيل بصمة الوجه
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="submit">
          <!-- Employee Info -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-subtitle-2">
              <strong>الموظف:</strong> {{ employee?.name }}
            </div>
            <div class="text-caption">
              <strong>رقم الموظف:</strong> {{ employee?.employee_no }}
            </div>
          </v-alert>

          <!-- Device Selection -->
          <v-select
            v-model="form.device_id"
            label="اختر الجهاز *"
            :items="devices"
            item-title="name"
            item-value="id"
            prepend-inner-icon="mdi-devices"
            variant="outlined"
            :rules="[rules.required]"
            :loading="loadingDevices"
            hint="الجهاز الذي سيتم تسجيل الوجه عليه"
            persistent-hint
            class="mb-4"
          >
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`${item.raw.ip_address} - ${getDeviceTypeLabel(item.raw.device_type)}`"
              />
            </template>
          </v-select>

          <!-- Face Image Upload -->
          <v-file-input
            v-model="form.face_image"
            label="صورة الوجه *"
            accept="image/jpeg,image/jpg,image/png"
            prepend-icon="mdi-camera"
            variant="outlined"
            :rules="[rules.required, rules.fileSize, rules.fileType]"
            hint="صيغة JPG أو PNG، بحد أقصى 5MB"
            persistent-hint
            show-size
            @change="previewImage"
          />

          <!-- Image Preview -->
          <v-card v-if="imagePreview" variant="outlined" class="mt-4">
            <v-card-text class="text-center pa-4">
              <v-img
                :src="imagePreview"
                max-width="300"
                max-height="300"
                class="mx-auto"
                style="border-radius: 8px;"
              />
              <div class="text-caption text-grey mt-2">
                معاينة صورة الوجه
              </div>
            </v-card-text>
          </v-card>

          <!-- Guidelines -->
          <v-alert type="warning" variant="tonal" class="mt-4" density="compact">
            <div class="text-caption">
              <strong>إرشادات تسجيل الوجه:</strong>
              <ul class="mt-1">
                <li>الصورة يجب أن تكون واضحة وذات إضاءة جيدة</li>
                <li>الوجه يجب أن يكون مواجهاً للكاميرا مباشرة</li>
                <li>تجنب النظارات الشمسية أو أي شيء يغطي الوجه</li>
                <li>الحجم المثالي: 400x400 بكسل على الأقل</li>
              </ul>
            </div>
          </v-alert>

          <!-- Error Message -->
          <v-alert v-if="error" type="error" variant="tonal" class="mt-4" closable @click:close="error = ''">
            {{ error }}
          </v-alert>

          <!-- Success Message -->
          <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
            {{ success }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <span v-if="!success" class="text-caption text-grey">
          <v-icon size="small" color="info">mdi-information</v-icon>
          🎭 Mock Mode - للتطوير بدون جهاز حقيقي
        </span>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="loading">
          إلغاء
        </v-btn>
        <v-btn 
          color="success" 
          variant="elevated" 
          @click="submit" 
          :loading="loading"
          :disabled="!form.device_id || !form.face_image || success"
        >
          <v-icon start>mdi-check</v-icon>
          تسجيل الوجه
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
  employee: Object
})

const emit = defineEmits(['update:modelValue', 'registered'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref(null)
const loading = ref(false)
const loadingDevices = ref(false)
const devices = ref([])
const error = ref('')
const success = ref('')
const imagePreview = ref(null)

const form = ref({
  device_id: null,
  face_image: null
})

const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  fileSize: value => {
    if (!value || !value.length) return true
    return value[0].size <= 5 * 1024 * 1024 || 'حجم الملف يجب أن لا يتجاوز 5MB'
  },
  fileType: value => {
    if (!value || !value.length) return true
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    return allowedTypes.includes(value[0].type) || 'فقط صور JPG أو PNG مسموحة'
  }
}

const previewImage = () => {
  if (form.value.face_image && form.value.face_image.length > 0) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(form.value.face_image[0])
  } else {
    imagePreview.value = null
  }
}

const loadDevices = async () => {
  loadingDevices.value = true
  try {
    const response = await axios.get('/devices', {
      params: {
        is_active: true,
        limit: 100
      }
    })
    devices.value = response.data.data.devices || []
  } catch (err) {
    console.error('Error loading devices:', err)
    error.value = 'فشل تحميل قائمة الأجهزة'
  } finally {
    loadingDevices.value = false
  }
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

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const formData = new FormData()
    formData.append('employee_id', props.employee.id)
    formData.append('device_id', form.value.device_id)
    formData.append('face_image', form.value.face_image[0])

    const response = await axios.post('/biometrics/face/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    success.value = response.data.message || 'تم تسجيل الوجه بنجاح!'
    
    setTimeout(() => {
      emit('registered', response.data.data)
      close()
    }, 2000)

  } catch (err) {
    console.error('Error registering face:', err)
    error.value = err.response?.data?.message || 'فشل تسجيل الوجه. يرجى المحاولة مرة أخرى.'
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (!loading.value) {
    form.value = {
      device_id: null,
      face_image: null
    }
    imagePreview.value = null
    error.value = ''
    success.value = ''
    if (formRef.value) {
      formRef.value.resetValidation()
    }
    dialog.value = false
  }
}

watch(dialog, (newVal) => {
  if (newVal) {
    loadDevices()
  }
})
</script>
