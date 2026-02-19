<template>
  <v-dialog v-model="dialog" max-width="620px" persistent>
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

          <!-- Image Source Tabs -->
          <v-tabs v-model="imageTab" color="success" class="mb-1" density="compact">
            <v-tab value="upload">
              <v-icon start size="small">mdi-upload</v-icon>
              رفع صورة
            </v-tab>
            <v-tab value="camera">
              <v-icon start size="small">mdi-camera</v-icon>
              كاميرا الحاسبة
            </v-tab>
          </v-tabs>

          <v-divider class="mb-4" />

          <v-window v-model="imageTab">
            <!-- File Upload Tab -->
            <v-window-item value="upload">
              <v-file-input
                v-model="form.face_image"
                label="صورة الوجه *"
                accept="image/jpeg,image/jpg,image/png"
                prepend-icon="mdi-image"
                variant="outlined"
                :rules="imageTab === 'upload' ? [rules.required, rules.fileSize, rules.fileType] : []"
                hint="صيغة JPG أو PNG، بحد أقصى 5MB"
                persistent-hint
                show-size
                @change="previewImage"
              />
              <v-card v-if="imagePreview" variant="outlined" class="mt-4">
                <v-card-text class="text-center pa-3">
                  <v-img
                    :src="imagePreview"
                    max-width="280"
                    max-height="280"
                    class="mx-auto"
                    style="border-radius: 8px;"
                  />
                  <div class="text-caption text-grey mt-2">معاينة صورة الوجه</div>
                </v-card-text>
              </v-card>
            </v-window-item>

            <!-- Camera Tab -->
            <v-window-item value="camera">
              <div class="text-center">
                <!-- Live video feed -->
                <div v-show="cameraActive && !capturedImageUrl" class="mb-3">
                  <video
                    ref="videoRef"
                    autoplay
                    playsinline
                    muted
                    style="width: 100%; max-width: 400px; border-radius: 8px; background: #000; display: block; margin: 0 auto;"
                  />
                </div>

                <!-- Captured photo preview -->
                <div v-if="capturedImageUrl" class="mb-3">
                  <v-img
                    :src="capturedImageUrl"
                    max-width="400"
                    max-height="300"
                    class="mx-auto"
                    style="border-radius: 8px;"
                  />
                  <div class="text-caption text-grey mt-1">تمت لقطة الصورة - جاهزة للتسجيل</div>
                </div>

                <!-- Idle state -->
                <div v-if="!cameraActive && !capturedImageUrl" class="py-6">
                  <v-icon size="64" color="grey-lighten-1">mdi-camera-off</v-icon>
                  <div class="text-grey mt-2 text-body-2">اضغط "تفعيل الكاميرا" للبدء</div>
                </div>

                <!-- Hidden canvas for capture -->
                <canvas ref="canvasRef" style="display: none;" />

                <!-- Camera controls -->
                <div class="d-flex justify-center flex-wrap ga-2 mt-3">
                  <v-btn
                    v-if="!cameraActive && !capturedImageUrl"
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @click="startCamera"
                  >
                    تفعيل الكاميرا
                  </v-btn>

                  <v-btn
                    v-if="cameraActive && !capturedImageUrl"
                    color="success"
                    variant="elevated"
                    prepend-icon="mdi-camera-iris"
                    size="large"
                    @click="capturePhoto"
                  >
                    التقاط صورة
                  </v-btn>

                  <v-btn
                    v-if="capturedImageUrl"
                    color="warning"
                    variant="outlined"
                    prepend-icon="mdi-reload"
                    @click="retakePhoto"
                  >
                    إعادة التقاط
                  </v-btn>

                  <v-btn
                    v-if="cameraActive"
                    color="error"
                    variant="text"
                    prepend-icon="mdi-camera-off"
                    @click="stopCamera"
                  >
                    إيقاف الكاميرا
                  </v-btn>
                </div>

                <v-alert
                  v-if="cameraError"
                  type="error"
                  variant="tonal"
                  class="mt-3"
                  density="compact"
                >
                  {{ cameraError }}
                </v-alert>
              </div>
            </v-window-item>
          </v-window>

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

          <!-- Error / Success Messages -->
          <v-alert v-if="error" type="error" variant="tonal" class="mt-4" closable @click:close="error = ''">
            {{ error }}
          </v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
            {{ success }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="loading">
          إلغاء
        </v-btn>
        <v-btn
          color="success"
          variant="elevated"
          @click="submit"
          :loading="loading"
          :disabled="!canSubmit || !!success"
        >
          <v-icon start>mdi-check</v-icon>
          تسجيل الوجه
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
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

// Tabs
const imageTab = ref('upload')

// Camera refs & state
const videoRef = ref(null)
const canvasRef = ref(null)
const cameraActive = ref(false)
const cameraStream = ref(null)
const capturedImageUrl = ref(null)
const capturedBlob = ref(null)
const cameraError = ref('')

const form = ref({
  device_id: null,
  face_image: null
})

const canSubmit = computed(() => {
  if (!form.value.device_id) return false
  if (imageTab.value === 'upload') return !!(form.value.face_image && form.value.face_image.length)
  if (imageTab.value === 'camera') return !!capturedBlob.value
  return false
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
    reader.onload = (e) => { imagePreview.value = e.target.result }
    reader.readAsDataURL(form.value.face_image[0])
  } else {
    imagePreview.value = null
  }
}

// --- Camera methods ---

const startCamera = async () => {
  cameraError.value = ''
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
    })
    cameraStream.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    cameraActive.value = true
  } catch (err) {
    cameraError.value = 'لا يمكن الوصول للكاميرا. تأكد من منح الإذن في المتصفح.'
    console.error('[Camera] Error:', err)
  }
}

const stopCamera = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
  cameraActive.value = false
}

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return
  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0)
  canvas.toBlob((blob) => {
    if (!blob) return
    capturedBlob.value = blob
    capturedImageUrl.value = URL.createObjectURL(blob)
    stopCamera()
  }, 'image/jpeg', 0.92)
}

const retakePhoto = () => {
  if (capturedImageUrl.value) URL.revokeObjectURL(capturedImageUrl.value)
  capturedImageUrl.value = null
  capturedBlob.value = null
  startCamera()
}

// --- Devices ---

const loadDevices = async () => {
  loadingDevices.value = true
  try {
    const response = await axios.get('/devices', {
      params: { is_active: true, limit: 100 }
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

// --- Submit ---

const submit = async () => {
  if (!form.value.device_id) {
    error.value = 'يرجى اختيار الجهاز'
    return
  }

  if (imageTab.value === 'upload') {
    const { valid } = await formRef.value.validate()
    if (!valid) return
  } else if (!capturedBlob.value) {
    error.value = 'يرجى التقاط صورة أولاً'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const formData = new FormData()
    formData.append('employee_id', props.employee.id)
    formData.append('device_id', form.value.device_id)

    if (imageTab.value === 'upload') {
      formData.append('face_image', form.value.face_image[0])
    } else {
      const file = new File([capturedBlob.value], 'face-capture.jpg', { type: 'image/jpeg' })
      formData.append('face_image', file)
    }

    const response = await axios.post('/biometrics/face/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
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

// --- Lifecycle / Watchers ---

const close = () => {
  if (!loading.value) {
    stopCamera()
    if (capturedImageUrl.value) URL.revokeObjectURL(capturedImageUrl.value)
    form.value = { device_id: null, face_image: null }
    imagePreview.value = null
    imageTab.value = 'upload'
    capturedImageUrl.value = null
    capturedBlob.value = null
    cameraError.value = ''
    error.value = ''
    success.value = ''
    if (formRef.value) formRef.value.resetValidation()
    dialog.value = false
  }
}

watch(imageTab, (newTab) => {
  if (newTab !== 'camera') {
    stopCamera()
    capturedImageUrl.value = null
    capturedBlob.value = null
    cameraError.value = ''
  }
})

watch(dialog, (newVal) => {
  if (newVal) {
    loadDevices()
  } else {
    stopCamera()
  }
})

onUnmounted(() => {
  stopCamera()
  if (capturedImageUrl.value) URL.revokeObjectURL(capturedImageUrl.value)
})
</script>
