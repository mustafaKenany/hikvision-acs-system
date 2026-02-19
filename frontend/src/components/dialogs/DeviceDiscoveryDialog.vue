<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon class="ml-2">mdi-radar</v-icon>
        <span>البحث عن الأجهزة</span>
        <v-spacer />
        <v-btn icon variant="text" @click="close" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Search Configuration -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchConfig.ipStart"
              label="بداية النطاق"
              variant="outlined"
              prepend-inner-icon="mdi-ip-network"
              placeholder="192.168.1.1"
              :rules="[rules.required, rules.ip]"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchConfig.ipEnd"
              label="نهاية النطاق"
              variant="outlined"
              prepend-inner-icon="mdi-ip-network"
              placeholder="192.168.1.254"
              :rules="[rules.required, rules.ip]"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="searchConfig.port"
              label="المنفذ"
              type="number"
              variant="outlined"
              prepend-inner-icon="mdi-lan"
              placeholder="80"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="searchConfig.timeout"
              label="وقت الانتظار (ثانية)"
              type="number"
              variant="outlined"
              prepend-inner-icon="mdi-clock-outline"
              placeholder="5"
            />
          </v-col>

          <!-- Username/Password for Discovery -->
          <v-col cols="12">
            <v-divider class="mb-2" />
            <p class="text-caption text-grey mb-3">
              <v-icon size="small" class="ml-1">mdi-information</v-icon>
              بيانات الدخول الافتراضية للبحث (اختياري - يستخدم admin/admin123 إذا كان فارغاً)
            </p>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchConfig.username"
              label="اسم المستخدم (اختياري)"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              placeholder="admin"
              hint="اتركه فارغاً لاستخدام الافتراضي"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchConfig.password"
              label="كلمة المرور (اختياري)"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              placeholder="admin123"
              hint="اتركها فارغة لاستخدام الافتراضي"
              persistent-hint
            />
          </v-col>
        </v-row>

        <v-btn
          color="primary"
          block
          size="large"
          @click="startDiscovery"
          :loading="discovering"
          :disabled="discovering"
        >
          <v-icon class="ml-2">mdi-magnify</v-icon>
          {{ discovering ? 'جاري البحث...' : 'بدء البحث' }}
        </v-btn>

        <!-- Progress -->
        <div v-if="discovering" class="mt-4">
          <v-progress-linear
            :model-value="discoveryProgress"
            color="primary"
            height="25"
            rounded
          >
            <template #default="{ value }">
              <strong>{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
          <p class="text-center text-caption mt-2">
            تم فحص {{ scannedDevices }} / {{ totalDevices }} جهاز
          </p>
        </div>

        <!-- Results -->
        <div v-if="discoveredDevices.length > 0" class="mt-6">
          <v-divider class="mb-4" />
          <h3 class="text-h6 mb-4">
            <v-icon class="ml-2">mdi-devices</v-icon>
            الأجهزة المكتشفة ({{ discoveredDevices.length }})
          </h3>

          <v-list>
            <v-list-item
              v-for="(device, index) in discoveredDevices"
              :key="index"
              class="mb-2 border rounded"
            >
              <template #prepend>
                <v-avatar color="success" size="40">
                  <v-icon color="white">mdi-devices</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ device.deviceInfo?.deviceName || 'جهاز غير معروف' }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <div class="mt-1">
                  <v-chip size="x-small" color="info" class="mr-2">
                    IP: {{ device.ip }}
                  </v-chip>
                  <v-chip size="x-small" color="secondary" class="mr-2">
                    Model: {{ device.deviceInfo?.model || 'N/A' }}
                  </v-chip>
                  <v-chip size="x-small" color="success">
                    Serial: {{ device.deviceInfo?.serialNumber || 'N/A' }}
                  </v-chip>
                </div>
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="addDevice(device)"
                  :disabled="device.adding"
                  :loading="device.adding"
                >
                  <v-icon class="ml-2">mdi-plus</v-icon>
                  إضافة للنظام
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- No Results -->
        <div v-else-if="!discovering && searched" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
          <p class="text-h6 mt-4 text-grey">لم يتم العثور على أي أجهزة</p>
          <p class="text-caption text-grey">
            تأكد من أن الأجهزة متصلة بالشبكة وأن نطاق IP صحيح
          </p>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close">
          إغلاق
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from '@/api/axios'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'deviceAdded'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const discovering = ref(false)
const searched = ref(false)
const discoveredDevices = ref([])
const scannedDevices = ref(0)
const totalDevices = ref(0)
const showPassword = ref(false)

const searchConfig = ref({
  ipStart: '192.168.1.1',
  ipEnd: '192.168.1.254',
  port: 80,
  timeout: 5,
  username: '',  // Optional - will use default if empty
  password: ''   // Optional - will use default if empty
})

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  ip: v => {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    return pattern.test(v) || 'عنوان IP غير صحيح'
  }
}

const discoveryProgress = computed(() => {
  if (totalDevices.value === 0) return 0
  return (scannedDevices.value / totalDevices.value) * 100
})

const startDiscovery = async () => {
  discovering.value = true
  searched.value = true
  discoveredDevices.value = []
  scannedDevices.value = 0

  try {
    const response = await axios.post('/devices/discover', searchConfig.value)
    
    if (response.data.success) {
      discoveredDevices.value = response.data.data.devices || []
      totalDevices.value = response.data.data.totalScanned || 0
      scannedDevices.value = totalDevices.value
    }
  } catch (error) {
    console.error('Discovery error:', error)
    alert(error.response?.data?.message || 'حدث خطأ أثناء البحث')
  } finally {
    discovering.value = false
  }
}

const addDevice = async (device) => {
  device.adding = true
  try {
    const deviceData = {
      name: device.deviceInfo?.deviceName || `جهاز ${device.ip}`,
      device_type: 'face_reader',
      ip_address: device.ip,
      port: searchConfig.value.port,
      username: 'admin',
      password: '', // User will need to provide
      serial_number: device.deviceInfo?.serialNumber,
      is_active: true,
      // Auto-sync time on add
      sync_time: true
    }

    emit('deviceAdded', deviceData)
    
    // Remove from discovered list
    const index = discoveredDevices.value.indexOf(device)
    if (index > -1) {
      discoveredDevices.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Add device error:', error)
    alert(error.response?.data?.message || 'حدث خطأ أثناء الإضافة')
  } finally {
    device.adding = false
  }
}

const close = () => {
  dialog.value = false
  discoveredDevices.value = []
  searched.value = false
  scannedDevices.value = 0
  totalDevices.value = 0
  showPassword.value = false
}
</script>
