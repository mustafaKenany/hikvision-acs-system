<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon class="ml-2">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        <span>{{ isEdit ? 'تعديل جهاز' : 'إضافة جهاز جديد' }}</span>
        <v-spacer />
        <v-btn icon variant="text" @click="close" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid">
          <v-row>
            <!-- اسم الجهاز -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="اسم الجهاز *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-devices"
                placeholder="مثال: جهاز المدخل الرئيسي"
              />
            </v-col>

            <!-- نوع الجهاز -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.device_type"
                label="نوع الجهاز *"
                :items="deviceTypes"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-shape"
              />
            </v-col>

            <!-- عنوان IP -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.ip_address"
                label="عنوان IP *"
                :rules="[rules.required, rules.ip]"
                variant="outlined"
                prepend-inner-icon="mdi-ip-network"
                placeholder="192.168.1.100"
              />
            </v-col>

            <!-- المنفذ -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.port"
                label="المنفذ (Port) *"
                :rules="[rules.required, rules.port]"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-lan"
                placeholder="80"
              />
            </v-col>

            <!-- اسم المستخدم -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.username"
                label="اسم المستخدم *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                placeholder="admin"
              />
            </v-col>

            <!-- كلمة المرور -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.password"
                label="كلمة المرور *"
                :rules="isEdit ? [] : [rules.required]"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :placeholder="isEdit ? 'اتركها فارغة لعدم التغيير' : ''"
              />
            </v-col>

            <!-- الرقم التسلسلي -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.serial_number"
                label="الرقم التسلسلي"
                variant="outlined"
                prepend-inner-icon="mdi-barcode"
              />
            </v-col>

            <!-- الموقع -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.location"
                label="الموقع"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                placeholder="مثال: البوابة الرئيسية"
              />
            </v-col>

            <!-- الوصف -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="الوصف"
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="3"
                placeholder="وصف إضافي عن الجهاز..."
              />
            </v-col>

            <!-- الحالة -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                label="الجهاز مفعّل"
                color="success"
                hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
          :disabled="loading"
        >
          إلغاء
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="save"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon class="ml-2">{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEdit ? 'حفظ التعديلات' : 'إضافة الجهاز' }}
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
  device: Object
})

const emit = defineEmits(['update:modelValue', 'saved'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref(null)
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const deviceTypes = [
  { title: 'قارئ بصمة الوجه', value: 'face_reader' },
  { title: 'قارئ بصمة الإصبع', value: 'fingerprint_reader' },
  { title: 'قارئ البطاقات', value: 'card_reader' },
  { title: 'جهاز متعدد الوظائف', value: 'multi_biometric' },
  { title: 'آخر', value: 'other' }
]

const defaultFormData = {
  name: '',
  device_type: 'face_reader',
  ip_address: '',
  port: 80,
  username: 'admin',
  password: '',
  serial_number: '',
  location: '',
  description: '',
  is_active: true
}

const formData = ref({ ...defaultFormData })

const isEdit = computed(() => !!props.device)

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  ip: v => {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    return pattern.test(v) || 'عنوان IP غير صحيح'
  },
  port: v => {
    return (v >= 1 && v <= 65535) || 'المنفذ يجب أن يكون بين 1 و 65535'
  }
}

watch(() => props.device, (newVal) => {
  if (newVal) {
    formData.value = {
      ...newVal,
      password: '' // Don't show password
    }
  } else {
    formData.value = { ...defaultFormData }
  }
}, { immediate: true })

const close = () => {
  dialog.value = false
  form.value?.reset()
  formData.value = { ...defaultFormData }
}

const save = async () => {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  loading.value = true
  try {
    const dataToSend = { ...formData.value }
    
    // Remove password if empty during edit
    if (isEdit.value && !dataToSend.password) {
      delete dataToSend.password
    }

    if (isEdit.value) {
      await axios.put(`/devices/${props.device.id}`, dataToSend)
    } else {
      await axios.post('/devices', dataToSend)
    }

    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving device:', error)
    alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ')
  } finally {
    loading.value = false
  }
}
</script>
