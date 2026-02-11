<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700" persistent>
    <v-card>
      <v-card-title class="bg-warning text-white">
        <v-icon start>mdi-crown</v-icon>
        إدارة الاشتراك - {{ organization?.name }}
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="save">
          <v-row>
            <!-- Current Plan Info -->
            <v-col cols="12">
              <v-alert type="info" variant="tonal" class="mb-4">
                <div class="d-flex align-center">
                  <v-icon start>mdi-information</v-icon>
                  <div>
                    <strong>الخطة الحالية:</strong> {{ getSubscriptionText(organization?.subscription_plan) }}
                    <br />
                    <span v-if="organization?.subscription_end" class="text-caption">
                      تنتهي في: {{ formatDate(organization?.subscription_end) }}
                    </span>
                  </div>
                </div>
              </v-alert>
            </v-col>

            <!-- Subscription Plan -->
            <v-col cols="12">
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
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="getPlanColor(item.value)">mdi-crown</v-icon>
                    </template>
                    <template #append>
                      <v-chip :color="getPlanColor(item.value)" size="small">
                        {{ getPlanLimits(item.value).employees }} موظف
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Plan Features -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1">مميزات الخطة المختارة</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="success">mdi-account-group</v-icon>
                      </template>
                      <v-list-item-title>
                        حد الموظفين: <strong>{{ selectedPlanLimits.employees }}</strong> موظف
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="info">mdi-devices</v-icon>
                      </template>
                      <v-list-item-title>
                        حد الأجهزة: <strong>{{ selectedPlanLimits.devices }}</strong> جهاز
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="warning">mdi-harddisk</v-icon>
                      </template>
                      <v-list-item-title>
                        مساحة التخزين: <strong>{{ selectedPlanLimits.storage }}</strong> MB
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Subscription Start -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.subscription_start"
                label="بداية الاشتراك *"
                prepend-inner-icon="mdi-calendar-start"
                variant="outlined"
                type="date"
                :rules="[rules.required]"
                required
              />
            </v-col>

            <!-- Subscription End -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.subscription_end"
                label="نهاية الاشتراك *"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                type="date"
                :rules="[rules.required, rules.dateAfterStart]"
                required
              />
            </v-col>

            <!-- Custom Limits Section -->
            <v-col cols="12">
              <v-divider class="my-2" />
              <h3 class="text-subtitle-1 mb-4">
                <v-icon start>mdi-cog</v-icon>
                تخصيص الحدود (اختياري)
              </h3>
            </v-col>

            <!-- Max Employees -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.max_employees"
                label="الحد الأقصى للموظفين"
                prepend-inner-icon="mdi-account-group"
                variant="outlined"
                type="number"
                :rules="[rules.positive]"
                :hint="`القيمة الافتراضية: ${selectedPlanLimits.employees}`"
              />
            </v-col>

            <!-- Max Devices -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.max_devices"
                label="الحد الأقصى للأجهزة"
                prepend-inner-icon="mdi-devices"
                variant="outlined"
                type="number"
                :rules="[rules.positive]"
                :hint="`القيمة الافتراضية: ${selectedPlanLimits.devices}`"
              />
            </v-col>

            <!-- Storage Limit -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.storage_limit_mb"
                label="مساحة التخزين (MB)"
                prepend-inner-icon="mdi-harddisk"
                variant="outlined"
                type="number"
                :rules="[rules.positive]"
                :hint="`القيمة الافتراضية: ${selectedPlanLimits.storage}`"
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
        <v-btn color="warning" variant="elevated" @click="save" :loading="saving">
          <v-icon start>mdi-content-save</v-icon>
          تحديث الاشتراك
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const props = defineProps({
  modelValue: Boolean,
  organization: Object
})

const emit = defineEmits(['update:modelValue', 'updated'])

const form = ref(null)
const saving = ref(false)

const formData = ref({
  subscription_plan: 'free',
  subscription_start: null,
  subscription_end: null,
  max_employees: 10,
  max_devices: 5,
  storage_limit_mb: 100
})

const subscriptionPlans = [
  { text: 'مجاني - Free', value: 'free' },
  { text: 'أساسي - Basic', value: 'basic' },
  { text: 'احترافي - Pro', value: 'pro' },
  { text: 'مؤسسي - Enterprise', value: 'enterprise' }
]

const planLimits = {
  free: { employees: 10, devices: 5, storage: 100 },
  basic: { employees: 50, devices: 20, storage: 500 },
  pro: { employees: 200, devices: 50, storage: 2000 },
  enterprise: { employees: 1000, devices: 200, storage: 10000 }
}

const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  positive: value => !value || value > 0 || 'يجب أن تكون القيمة أكبر من صفر',
  dateAfterStart: value => {
    if (!value || !formData.value.subscription_start) return true
    return new Date(value) > new Date(formData.value.subscription_start) || 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
  }
}

const selectedPlanLimits = computed(() => {
  return planLimits[formData.value.subscription_plan] || planLimits.free
})

// Get plan limits
const getPlanLimits = (plan) => {
  return planLimits[plan] || planLimits.free
}

// Get plan color
const getPlanColor = (plan) => {
  const colors = {
    free: 'grey',
    basic: 'blue',
    pro: 'purple',
    enterprise: 'orange'
  }
  return colors[plan] || 'grey'
}

// Get subscription text
const getSubscriptionText = (plan) => {
  const texts = {
    free: 'مجاني',
    basic: 'أساسي',
    pro: 'احترافي',
    enterprise: 'مؤسسي'
  }
  return texts[plan] || plan
}

// Format date
const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar })
}

// Update limits based on subscription plan
const updateLimits = (plan) => {
  const limits = getPlanLimits(plan)
  formData.value.max_employees = limits.employees
  formData.value.max_devices = limits.devices
  formData.value.storage_limit_mb = limits.storage
}

// Reset form
const resetForm = () => {
  formData.value = {
    subscription_plan: 'free',
    subscription_start: null,
    subscription_end: null,
    max_employees: 10,
    max_devices: 5,
    storage_limit_mb: 100
  }
  form.value?.resetValidation()
}

// Watch for organization changes
watch(() => props.organization, (newVal) => {
  if (newVal) {
    formData.value = {
      subscription_plan: newVal.subscription_plan || 'free',
      subscription_start: newVal.subscription_start?.split('T')[0] || null,
      subscription_end: newVal.subscription_end?.split('T')[0] || null,
      max_employees: newVal.max_employees || 10,
      max_devices: newVal.max_devices || 5,
      storage_limit_mb: newVal.storage_limit_mb || 100
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Save subscription
const save = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  try {
    await axios.put(`/api/organizations/${props.organization.id}/subscription`, formData.value)
    emit('updated')
    close()
  } catch (error) {
    console.error('Error updating subscription:', error)
    const errorMsg = error.response?.data?.error || 'حدث خطأ أثناء تحديث الاشتراك'
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
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>
