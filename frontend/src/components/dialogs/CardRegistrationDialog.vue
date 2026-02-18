<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-card-account-details</v-icon>
        تسجيل بطاقة (RFID/NFC)
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
            hint="الجهاز الذي سيتم تسجيل البطاقة عليه"
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

          <!-- Card Number -->
          <v-text-field
            v-model="form.card_number"
            label="رقم البطاقة *"
            prepend-inner-icon="mdi-numeric"
            variant="outlined"
            :rules="[rules.required, rules.cardNumber]"
            hint="رقم البطاقة RFID أو NFC (8-10 أرقام)"
            persistent-hint
            counter="10"
            maxlength="10"
            class="mb-4"
          />

          <!-- Card Type -->
          <v-select
            v-model="form.card_type"
            label="نوع البطاقة *"
            :items="cardTypes"
            item-title="text"
            item-value="value"
            prepend-inner-icon="mdi-card-text"
            variant="outlined"
            :rules="[rules.required]"
            hint="اختر نوع البطاقة المستخدمة"
            persistent-hint
          />

          <!-- Guidelines -->
          <v-alert type="info" variant="tonal" class="mt-4" density="compact">
            <div class="text-caption">
              <strong>ملاحظات:</strong>
              <ul class="mt-1">
                <li>رقم البطاقة يجب أن يكون فريداً لكل موظف</li>
                <li>تأكد من كتابة الرقم الصحيح المطبوع على البطاقة</li>
                <li>RFID: بطاقات 125KHz أو 13.56MHz</li>
                <li>NFC: بطاقات Near Field Communication</li>
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
          color="primary" 
          variant="elevated" 
          @click="submit" 
          :loading="loading"
          :disabled="!form.device_id || !form.card_number || success"
        >
          <v-icon start>mdi-check</v-icon>
          تسجيل البطاقة
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

const form = ref({
  device_id: null,
  card_number: '',
  card_type: 'rfid'
})

const cardTypes = [
  { text: 'RFID - بطاقة تردد راديوي', value: 'rfid' },
  { text: 'NFC - اتصال قريب المدى', value: 'nfc' },
  { text: 'QR Code - رمز استجابة سريع', value: 'qr_code' },
  { text: 'Barcode - باركود', value: 'barcode' }
]

const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  cardNumber: value => {
    if (!value) return true
    const cleaned = value.replace(/\s/g, '')
    if (cleaned.length < 8 || cleaned.length > 10) {
      return 'رقم البطاقة يجب أن يكون بين 8 و 10 أرقام'
    }
    if (!/^\d+$/.test(cleaned)) {
      return 'رقم البطاقة يجب أن يحتوي على أرقام فقط'
    }
    return true
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
    const response = await axios.post('/biometrics/card/register', {
      employee_id: props.employee.id,
      device_id: form.value.device_id,
      card_number: form.value.card_number.replace(/\s/g, ''),
      card_type: form.value.card_type
    })

    success.value = response.data.message || 'تم تسجيل البطاقة بنجاح!'
    
    setTimeout(() => {
      emit('registered', response.data.data)
      close()
    }, 2000)

  } catch (err) {
    console.error('Error registering card:', err)
    error.value = err.response?.data?.message || 'فشل تسجيل البطاقة. يرجى المحاولة مرة أخرى.'
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (!loading.value) {
    form.value = {
      device_id: null,
      card_number: '',
      card_type: 'rfid'
    }
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
