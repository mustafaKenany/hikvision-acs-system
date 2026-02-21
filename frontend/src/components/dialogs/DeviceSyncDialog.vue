<!-- Device Sync Dialog -->
<template>
  <v-dialog v-model="dialog" max-width="700" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-sync</v-icon>
        مزامنة الموظفين من الأجهزة
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert v-if="!syncing && !syncResult" type="info" variant="tonal" class="mb-4">
          <strong>طريقة العمل:</strong><br/>
          1. قم بتسجيل الموظفين مباشرة على الجهاز (من واجهة الجهاز)<br/>
          2. اضغط "مزامنة الآن" لجلب الموظفين الجدد إلى النظام<br/>
          3. سيتم إضافة الموظفين الجدد فقط (الموجودين لن يتأثروا)
        </v-alert>

        <!-- Device Selection -->
        <v-select
          v-if="!syncing && !syncResult"
          v-model="selectedDevice"
          label="اختر الجهاز"
          :items="devices"
          item-title="name"
          item-value="id"
          variant="outlined"
          prepend-icon="mdi-devices"
          :hint="`سيتم المزامنة من الجهاز: ${selectedDevice ? getDeviceHint(selectedDevice) : 'اختر جهاز'}`"
          persistent-hint
          class="mb-4"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon color="info">mdi-router-wireless</v-icon>
              </template>
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.raw.ip_address }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>

        <!-- OR Sync All -->
        <div v-if="!syncing && !syncResult" class="text-center my-4">
          <v-divider />
          <v-chip class="my-2">أو</v-chip>
          <v-divider />
        </div>

        <!-- Syncing Progress -->
        <div v-if="syncing" class="text-center py-8">
          <v-progress-circular
            :size="70"
            :width="7"
            color="primary"
            indeterminate
          />
          <div class="mt-4 text-h6">جاري المزامنة...</div>
          <div class="text-caption text-grey">{{ syncStatus }}</div>
        </div>

        <!-- Sync Result -->
        <div v-if="syncResult && !syncing">
          <v-alert 
            :type="syncResult.success ? 'success' : 'error'" 
            variant="tonal"
            prominent
            class="mb-4"
          >
            <div class="text-h6 mb-2">
              {{ syncResult.message }}
            </div>
          </v-alert>

          <v-card v-if="syncResult.summary" variant="outlined" class="mb-4">
            <v-card-title class="bg-grey-lighten-4 text-subtitle-1">
              📊 ملخص المزامنة
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="6">
                  <div class="text-caption text-grey">إجمالي على الجهاز:</div>
                  <div class="text-h6">{{ syncResult.summary.total_on_device }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">موجود في النظام:</div>
                  <div class="text-h6">{{ syncResult.summary.existing_in_system }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">موظفين جدد:</div>
                  <div class="text-h6 text-success">
                    {{ syncResult.summary.new_employees_found }}
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">تمت الإضافة:</div>
                  <div class="text-h6 text-success">
                    {{ syncResult.summary.successfully_added }}
                  </div>
                </v-col>
                <v-col cols="6" v-if="syncResult.summary.failed > 0">
                  <div class="text-caption text-grey">فشل:</div>
                  <div class="text-h6 text-error">{{ syncResult.summary.failed }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Added Employees List -->
          <v-card v-if="syncResult.added_employees && syncResult.added_employees.length > 0" variant="outlined">
            <v-card-title class="bg-success-lighten-4 text-subtitle-1">
              ✅ الموظفين المضافين ({{ syncResult.added_employees.length }})
            </v-card-title>
            <v-list density="compact">
              <v-list-item
                v-for="emp in syncResult.added_employees"
                :key="emp.employee_no"
              >
                <template #prepend>
                  <v-icon color="success">mdi-account-check</v-icon>
                </template>
                <v-list-item-title>{{ emp.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  رقم: {{ emp.employee_no }}
                  <v-chip size="x-small" class="mx-1" v-if="emp.has_face" color="info">
                    <v-icon start size="x-small">mdi-face-recognition</v-icon>
                    وجه
                  </v-chip>
                  <v-chip size="x-small" v-if="emp.has_card" color="warning">
                    <v-icon start size="x-small">mdi-card-account-details</v-icon>
                    كارت
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Failed Employees List -->
          <v-card 
            v-if="syncResult.failed_employees && syncResult.failed_employees.length > 0" 
            variant="outlined"
            class="mt-4"
          >
            <v-card-title class="bg-error-lighten-4 text-subtitle-1">
              ❌ فشل في الإضافة ({{ syncResult.failed_employees.length }})
            </v-card-title>
            <v-list density="compact">
              <v-list-item
                v-for="emp in syncResult.failed_employees"
                :key="emp.employee_no"
              >
                <template #prepend>
                  <v-icon color="error">mdi-alert-circle</v-icon>
                </template>
                <v-list-item-title>{{ emp.name || emp.employee_no }}</v-list-item-title>
                <v-list-item-subtitle class="text-error">
                  {{ emp.error }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          v-if="!syncing && !syncResult"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-sync"
          @click="syncFromDevice"
          :disabled="!selectedDevice"
        >
          مزامنة من الجهاز المحدد
        </v-btn>

        <v-btn
          v-if="!syncing && !syncResult"
          color="info"
          variant="tonal"
          prepend-icon="mdi-sync-circle"
          @click="syncFromAllDevices"
        >
          مزامنة من كل الأجهزة
        </v-btn>

        <v-spacer />

        <v-btn
          v-if="syncResult"
          color="success"
          prepend-icon="mdi-refresh"
          @click="resetSync"
        >
          مزامنة مرة أخرى
        </v-btn>

        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="syncing"
        >
          {{ syncResult ? 'إغلاق' : 'إلغاء' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/api/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const emit = defineEmits(['synced', 'close']);

const { showSuccess, showError } = useSnackbar();

const dialog = ref(true);
const devices = ref([]);
const selectedDevice = ref(null);
const syncing = ref(false);
const syncStatus = ref('');
const syncResult = ref(null);

onMounted(async () => {
  await fetchDevices();
});

const fetchDevices = async () => {
  try {
    const response = await axios.get('/devices');
    // Handle both paginated and non-paginated responses
    devices.value = Array.isArray(response.data.data) 
      ? response.data.data 
      : (response.data.data.devices || []);
    
    // Auto-select first device if only one exists
    if (devices.value.length === 1) {
      selectedDevice.value = devices.value[0].id;
    }
  } catch (error) {
    showError('فشل في جلب قائمة الأجهزة');
  }
};

const getDeviceHint = (deviceId) => {
  const device = devices.value.find(d => d.id === deviceId);
  return device ? `${device.name} (${device.ip_address})` : '';
};

const syncFromDevice = async () => {
  if (!selectedDevice.value) {
    showError('يرجى اختيار جهاز');
    return;
  }

  syncing.value = true;
  syncStatus.value = 'جاري الاتصال بالجهاز...';

  try {
    syncStatus.value = 'جاري جلب قائمة الموظفين من الجهاز...';
    const response = await axios.post(`/devices/${selectedDevice.value}/sync`);
    
    syncResult.value = response.data.data;
    showSuccess(response.data.message);
    
    emit('synced');
  } catch (error) {
    showError(error.response?.data?.message || 'فشلت عملية المزامنة');
    syncResult.value = {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء المزامنة'
    };
  } finally {
    syncing.value = false;
    syncStatus.value = '';
  }
};

const syncFromAllDevices = async () => {
  syncing.value = true;
  syncStatus.value = 'جاري المزامنة من جميع الأجهزة...';

  try {
    const response = await axios.post('/devices/sync-all');
    
    syncResult.value = response.data.data;
    showSuccess(response.data.message);
    
    emit('synced');
  } catch (error) {
    showError(error.response?.data?.message || 'فشلت عملية المزامنة');
    syncResult.value = {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ أثناء المزامنة'
    };
  } finally {
    syncing.value = false;
    syncStatus.value = '';
  }
};

const resetSync = () => {
  syncResult.value = null;
  selectedDevice.value = null;
};

const closeDialog = () => {
  dialog.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};
</script>
