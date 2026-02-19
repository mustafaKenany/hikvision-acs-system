<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800">
    <v-card>
      <v-card-title>
        {{ schedule ? 'تعديل جدول الدوام' : 'إضافة جدول دوام جديد' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="اسم الجدول *"
            :rules="[v => !!v || 'الاسم مطلوب']"
            outlined
            dense
          />

          <v-switch
            v-model="form.is_flexible"
            label="دوام مرن (بدون أوقات محددة)"
            color="primary"
            hide-details
            class="mb-4"
          />

          <v-row v-if="!form.is_flexible">
            <v-col cols="6">
              <v-text-field
                v-model="form.start_time"
                label="وقت البداية *"
                type="time"
                step="1"
                :rules="[v => !!v || 'وقت البداية مطلوب']"
                outlined
                dense
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.end_time"
                label="وقت النهاية *"
                type="time"
                step="1"
                :rules="[v => !!v || 'وقت النهاية مطلوب']"
                outlined
                dense
              />
            </v-col>
          </v-row>

          <v-card variant="outlined" class="mb-4">
            <v-card-subtitle>أيام العمل *</v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col v-for="(day, index) in dayNames" :key="index" cols="3">
                  <v-checkbox
                    v-model="form.work_days"
                    :label="day"
                    :value="index"
                    hide-details
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model.number="form.expected_hours"
                label="الساعات المطلوبة *"
                type="number"
                min="1"
                max="24"
                step="0.5"
                :rules="[v => v > 0 || 'يجب أن تكون أكبر من 0']"
                outlined
                dense
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="form.late_grace_minutes"
                label="فترة السماح للتأخير (دقيقة)"
                type="number"
                min="0"
                max="120"
                outlined
                dense
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="form.break_minutes"
                label="فترة الاستراحة (دقيقة)"
                type="number"
                min="0"
                max="240"
                outlined
                dense
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.early_leave_grace_minutes"
                label="فترة السماح للمغادرة المبكرة (دقيقة)"
                type="number"
                min="0"
                max="120"
                outlined
                dense
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="form.half_day_hours"
                label="ساعات نصف يوم"
                type="number"
                min="1"
                max="12"
                step="0.5"
                outlined
                dense
              />
            </v-col>
          </v-row>

          <v-switch
            v-model="form.is_active"
            label="جدول نشط"
            color="success"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">إلغاء</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">حفظ</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'
import { useSnackbar } from '@/composables/useSnackbar'

const props = defineProps({
  modelValue: Boolean,
  schedule: Object
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { showSuccess, showError } = useSnackbar()

const formRef = ref(null)
const saving = ref(false)

const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

const defaultForm = {
  name: '',
  start_time: '08:00:00',
  end_time: '17:00:00',
  work_days: [0, 1, 2, 3, 4], // Sunday to Thursday
  expected_hours: 8,
  late_grace_minutes: 15,
  early_leave_grace_minutes: 15,
  break_minutes: 60,
  half_day_hours: 4,
  is_flexible: false,
  is_active: true
}

const form = ref({ ...defaultForm })

watch(() => props.schedule, (newSchedule) => {
  if (newSchedule) {
    form.value = {
      ...newSchedule,
      work_days: [...newSchedule.work_days]
    }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  if (form.value.work_days.length === 0) {
    showError('يجب اختيار يوم عمل واحد على الأقل')
    return
  }

  saving.value = true
  try {
    const payload = { ...form.value }
    
    // If flexible, remove start/end times
    if (payload.is_flexible) {
      delete payload.start_time
      delete payload.end_time
    }

    if (props.schedule) {
      await axios.put(`/work-schedules/${props.schedule.id}`, payload)
      showSuccess('تم تحديث جدول الدوام بنجاح')
    } else {
      await axios.post('/work-schedules', payload)
      showSuccess('تم إضافة جدول الدوام بنجاح')
    }
    
    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    showError(error.response?.data?.message || 'فشل حفظ جدول الدوام')
  } finally {
    saving.value = false
  }
}
</script>
