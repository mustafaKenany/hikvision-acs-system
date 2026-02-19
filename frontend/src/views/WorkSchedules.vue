<template>
  <v-container fluid class="pa-6">
    <!-- Page Header with Gradient -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="page-header">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">
                <v-icon size="40" color="primary" class="me-3">mdi-calendar-clock</v-icon>
                جداول الدوام
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">إدارة وتنظيم أوقات العمل</p>
            </div>
            <v-btn 
              color="primary" 
              size="large"
              prepend-icon="mdi-plus-circle"
              @click="openDialog(null)"
              elevation="2"
              class="add-btn"
            >
              إضافة جدول دوام
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold primary--text">{{ stats.total }}</div>
                <div class="text-body-2 text-medium-emphasis mt-1">إجمالي الجداول</div>
              </div>
              <div class="stat-icon primary">
                <v-icon size="40" color="white">mdi-calendar-multiple</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold success--text">{{ stats.active }}</div>
                <div class="text-body-2 text-medium-emphasis mt-1">جداول نشطة</div>
              </div>
              <div class="stat-icon success">
                <v-icon size="40" color="white">mdi-check-circle</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold info--text">{{ stats.flexible }}</div>
                <div class="text-body-2 text-medium-emphasis mt-1">دوام مرن</div>
              </div>
              <div class="stat-icon info">
                <v-icon size="40" color="white">mdi-clock-outline</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold orange--text">{{ stats.fixed }}</div>
                <div class="text-body-2 text-medium-emphasis mt-1">دوام ثابت</div>
              </div>
              <div class="stat-icon orange">
                <v-icon size="40" color="white">mdi-clock-check</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Card -->
    <v-card elevation="4" class="main-card">
      <v-card-text class="pa-6">
        <!-- Search and Filters -->
        <v-row class="mb-6">
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="بحث في جداول الدوام"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              class="search-field"
            />
          </v-col>
          
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filterActive"
              :items="activeFilterOptions"
              label="الحالة"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              prepend-inner-icon="mdi-filter"
            />
          </v-col>

          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filterType"
              :items="typeFilterOptions"
              label="النوع"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              prepend-inner-icon="mdi-shape"
            />
          </v-col>

          <v-col cols="6" sm="4" md="1">
            <v-btn 
              color="info" 
              block 
              size="large"
              @click="loadSchedules" 
              :loading="loading"
              icon="mdi-refresh"
              elevation="2"
            />
          </v-col>

          <v-col cols="6" sm="4" md="1">
            <v-btn 
              color="success" 
              block 
              size="large"
              @click="exportSchedules" 
              :disabled="!filteredSchedules.length"
              icon="mdi-microsoft-excel"
              elevation="2"
            />
          </v-col>

          <v-col cols="12" sm="4" md="1">
            <v-btn-toggle v-model="viewMode" mandatory color="primary" density="comfortable" class="view-toggle">
              <v-btn value="table" icon="mdi-table" />
              <v-btn value="cards" icon="mdi-view-grid" />
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- Table View -->
        <v-data-table
          v-if="viewMode === 'table'"
          :headers="headers"
          :items="filteredSchedules"
          :loading="loading"
          :items-per-page="25"
          :search="search"
          class="modern-table elevation-2"
          hover
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar color="primary" size="40" class="me-3">
                <v-icon color="white">mdi-calendar</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis" v-if="item.description">
                  {{ item.description }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:item.work_days="{ item }">
            <v-chip-group>
              <v-chip 
                v-for="day in item.work_days" 
                :key="day" 
                size="small"
                color="primary"
                variant="tonal"
                class="ma-1"
              >
                <v-icon start size="small">mdi-calendar-check</v-icon>
                {{ getDayName(day) }}
              </v-chip>
            </v-chip-group>
          </template>

          <template v-slot:item.time="{ item }">
            <div class="d-flex align-center">
              <v-chip color="blue-grey" variant="tonal" size="small" class="me-2">
                <v-icon start size="small">mdi-clock-start</v-icon>
                {{ item.start_time }}
              </v-chip>
              <v-icon size="small" class="mx-1">mdi-arrow-left</v-icon>
              <v-chip color="blue-grey" variant="tonal" size="small">
                <v-icon start size="small">mdi-clock-end</v-icon>
                {{ item.end_time }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.expected_hours="{ item }">
            <v-chip color="orange" variant="tonal" size="small">
              <v-icon start size="small">mdi-clock-time-eight</v-icon>
              {{ item.expected_hours }} ساعة
            </v-chip>
          </template>

          <template v-slot:item.is_flexible="{ item }">
            <v-chip 
              :color="item.is_flexible ? 'info' : 'success'" 
              :prepend-icon="item.is_flexible ? 'mdi-clock-outline' : 'mdi-clock-check'"
              size="small"
              variant="elevated"
            >
              {{ item.is_flexible ? 'مرن' : 'ثابت' }}
            </v-chip>
          </template>

          <template v-slot:item.is_active="{ item }">
            <v-chip 
              :color="item.is_active ? 'success' : 'error'" 
              :prepend-icon="item.is_active ? 'mdi-check-circle' : 'mdi-close-circle'"
              size="small"
              variant="elevated"
            >
              {{ item.is_active ? 'نشط' : 'موقوف' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="action-buttons">
              <v-btn 
                icon 
                size="small" 
                variant="tonal"
                color="primary"
                @click="openDialog(item)"
                class="me-1"
              >
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">تعديل</v-tooltip>
              </v-btn>
              <v-btn 
                icon 
                size="small" 
                variant="tonal"
                color="info" 
                @click="openEmployeesDialog(item)"
                class="me-1"
              >
                <v-icon>mdi-account-multiple</v-icon>
                <v-tooltip activator="parent" location="top">الموظفون</v-tooltip>
              </v-btn>
              <v-btn 
                icon 
                size="small" 
                variant="tonal"
                color="error" 
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">حذف</v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <!-- Cards View -->
        <v-row v-else>
          <v-col 
            v-for="schedule in filteredSchedules" 
            :key="schedule.id" 
            cols="12" 
            sm="6" 
            md="4" 
            lg="3"
          >
            <v-card class="schedule-card" elevation="3" hover>
              <!-- Card Header -->
              <div class="card-header">
                <div class="d-flex align-center justify-space-between mb-2">
                  <v-chip 
                    :color="schedule.is_active ? 'success' : 'error'" 
                    size="small"
                    variant="elevated"
                  >
                    <v-icon start size="small">
                      {{ schedule.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    {{ schedule.is_active ? 'نشط' : 'موقوف' }}
                  </v-chip>
                  <v-chip 
                    :color="schedule.is_flexible ? 'info' : 'orange'" 
                    size="small"
                    variant="tonal"
                  >
                    {{ schedule.is_flexible ? 'مرن' : 'ثابت' }}
                  </v-chip>
                </div>
                
                <div class="d-flex align-center mb-3">
                  <v-avatar color="primary" size="48" class="me-3">
                    <v-icon color="white" size="28">mdi-calendar-clock</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-bold">{{ schedule.name }}</h3>
                    <p class="text-caption text-medium-emphasis mb-0" v-if="schedule.description">
                      {{ schedule.description }}
                    </p>
                  </div>
                </div>
              </div>

              <v-divider />

              <!-- Card Body -->
              <v-card-text class="pa-4">
                <!-- Work Time -->
                <div class="info-row mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" size="20" class="me-2">mdi-clock-outline</v-icon>
                    <span class="text-body-2 font-weight-medium">أوقات الدوام</span>
                  </div>
                  <div class="d-flex align-center justify-space-between ps-7">
                    <v-chip color="blue-grey" variant="tonal" size="small">
                      <v-icon start size="small">mdi-clock-start</v-icon>
                      {{ schedule.start_time }}
                    </v-chip>
                    <v-icon size="small">mdi-arrow-left</v-icon>
                    <v-chip color="blue-grey" variant="tonal" size="small">
                      <v-icon start size="small">mdi-clock-end</v-icon>
                      {{ schedule.end_time }}
                    </v-chip>
                  </div>
                </div>

                <!-- Expected Hours -->
                <div class="info-row mb-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="orange" size="20" class="me-2">mdi-clock-time-eight</v-icon>
                      <span class="text-body-2">ساعات العمل</span>
                    </div>
                    <v-chip color="orange" variant="tonal" size="small">
                      {{ schedule.expected_hours }} ساعة
                    </v-chip>
                  </div>
                </div>

                <!-- Grace Period -->
                <div class="info-row mb-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="info" size="20" class="me-2">mdi-timer-sand</v-icon>
                      <span class="text-body-2">فترة السماح</span>
                    </div>
                    <v-chip color="info" variant="tonal" size="small">
                      {{ schedule.late_grace_minutes }} دقيقة
                    </v-chip>
                  </div>
                </div>

                <!-- Work Days -->
                <div class="info-row">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="success" size="20" class="me-2">mdi-calendar-multiple</v-icon>
                    <span class="text-body-2 font-weight-medium">أيام العمل</span>
                  </div>
                  <div class="d-flex flex-wrap gap-1 ps-7">
                    <v-chip
                      v-for="day in schedule.work_days"
                      :key="day"
                      color="success"
                      variant="tonal"
                      size="small"
                      class="ma-1"
                    >
                      {{ getDayName(day) }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>

              <v-divider />

              <!-- Card Actions -->
              <v-card-actions class="pa-3">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="openDialog(schedule)"
                  prepend-icon="mdi-pencil"
                  block
                >
                  تعديل
                </v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="info"
                  @click="openEmployeesDialog(schedule)"
                  prepend-icon="mdi-account-multiple"
                  block
                >
                  الموظفون
                </v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="confirmDelete(schedule)"
                  icon="mdi-delete"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Schedule Dialog -->
    <work-schedule-dialog
      v-model="dialogOpen"
      :schedule="selectedSchedule"
      @saved="loadSchedules"
    />

    <!-- Employees Dialog -->
    <schedule-employees-dialog
      v-model="employeesDialogOpen"
      :schedule="selectedSchedule"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSnackbar } from '@/composables/useSnackbar'
import axios from '@/api/axios'
import WorkScheduleDialog from '@/components/dialogs/WorkScheduleDialog.vue'
import ScheduleEmployeesDialog from '@/components/dialogs/ScheduleEmployeesDialog.vue'
import * as XLSX from 'xlsx'

const { showSuccess, showError } = useSnackbar()

const loading = ref(false)
const schedules = ref([])
const dialogOpen = ref(false)
const employeesDialogOpen = ref(false)
const selectedSchedule = ref(null)
const viewMode = ref('cards')

// Search and Filters
const search = ref('')
const filterActive = ref(null)
const filterType = ref(null)

const activeFilterOptions = [
  { title: 'نشط', value: true },
  { title: 'موقوف', value: false }
]

const typeFilterOptions = [
  { title: 'ثابت', value: false },
  { title: 'مرن', value: true }
]

// Computed filtered schedules
const filteredSchedules = computed(() => {
  let result = schedules.value

  // Filter by active status
  if (filterActive.value !== null && filterActive.value !== undefined) {
    result = result.filter(s => s.is_active === filterActive.value)
  }

  // Filter by type (flexible/fixed)
  if (filterType.value !== null && filterType.value !== undefined) {
    result = result.filter(s => s.is_flexible === filterType.value)
  }

  return result
})

// Statistics
const stats = computed(() => {
  const total = schedules.value.length
  const active = schedules.value.filter(s => s.is_active).length
  const flexible = schedules.value.filter(s => s.is_flexible).length
  const fixed = schedules.value.filter(s => !s.is_flexible).length
  
  return { total, active, flexible, fixed }
})

const headers = [
  { title: 'الاسم', key: 'name', align: 'start', width: '250px' },
  { title: 'الوقت', key: 'time', value: item => `${item.start_time} - ${item.end_time}`, width: '280px' },
  { title: 'أيام العمل', key: 'work_days', width: '300px' },
  { title: 'ساعات العمل', key: 'expected_hours', width: '130px' },
  { title: 'فترة السماح', key: 'late_grace_minutes', width: '120px' },
  { title: 'النوع', key: 'is_flexible', width: '100px' },
  { title: 'الحالة', key: 'is_active', width: '100px' },
  { title: 'الإجراءات', key: 'actions', sortable: false, width: '150px' }
]

const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

const getDayName = (day) => dayNames[day]

const loadSchedules = async () => {
  loading.value = true
  try {
    const response = await axios.get('/work-schedules')
    schedules.value = response.data.data.schedules
  } catch (error) {
    showError(error.response?.data?.message || 'فشل تحميل جداول الدوام')
  } finally {
    loading.value = false
  }
}

const exportSchedules = () => {
  if (!filteredSchedules.value.length) {
    showError('لا توجد بيانات للتصدير')
    return
  }

  const data = filteredSchedules.value.map(schedule => ({
    'الاسم': schedule.name,
    'وقت البداية': schedule.start_time || '-',
    'وقت النهاية': schedule.end_time || '-',
    'أيام العمل': schedule.work_days.map(d => dayNames[d]).join(', '),
    'الساعات المطلوبة': schedule.expected_hours,
    'فترة السماح (دقيقة)': schedule.late_grace_minutes,
    'الاستراحة (دقيقة)': schedule.break_minutes,
    'النوع': schedule.is_flexible ? 'مرن' : 'ثابت',
    'الحالة': schedule.is_active ? 'نشط' : 'موقوف'
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'جداول الدوام')
  
  const fileName = `work_schedules_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
  
  showSuccess('تم تصدير البيانات بنجاح')
}

const openDialog = (schedule) => {
  selectedSchedule.value = schedule
  dialogOpen.value = true
}

const openEmployeesDialog = (schedule) => {
  selectedSchedule.value = schedule
  employeesDialogOpen.value = true
}

const confirmDelete = (schedule) => {
  if (confirm(`هل أنت متأكد من حذف جدول "${schedule.name}"؟`)) {
    deleteSchedule(schedule.id)
  }
}

const deleteSchedule = async (id) => {
  try {
    await axios.delete(`/work-schedules/${id}`)
    showSuccess('تم حذف الجدول بنجاح')
    loadSchedules()
  } catch (error) {
    showError(error.response?.data?.message || 'فشل حذف الجدول')
  }
}

onMounted(() => {
  loadSchedules()
})
</script>
<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.page-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.add-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  color: white !important;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4) !important;
}

.stat-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: rotate(10deg) scale(1.1);
}

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stat-icon.success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
  box-shadow: 0 4px 12px rgba(86, 171, 47, 0.3);
}

.stat-icon.info {
  background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f46b45 0%, #eea849 100%);
  box-shadow: 0 4px 12px rgba(244, 107, 69, 0.3);
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1) !important;
}

.search-field :deep(.v-field) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.modern-table {
  border-radius: 12px;
  overflow: hidden;
}

.modern-table :deep(thead) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modern-table :deep(thead th) {
  color: white !important;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 16px !important;
  border: none !important;
}

.modern-table :deep(tbody tr) {
  transition: all 0.2s ease;
}

.modern-table :deep(tbody tr:hover) {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.modern-table :deep(tbody td) {
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-buttons .v-btn {
  transition: all 0.2s ease;
}

.action-buttons .v-btn:hover {
  transform: scale(1.1);
}

:deep(.v-chip) {
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.v-chip:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Animation for page load */
.stat-card,
.main-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* View Toggle Button */
.view-toggle {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  border-radius: 12px !important;
  overflow: hidden;
  height: 48px;
  width: 100%;
}

.view-toggle :deep(.v-btn) {
  min-width: 48px !important;
  height: 44px !important;
}

/* Schedule Cards Grid View */
.schedule-card {
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
  background: white;
  position: relative;
}

.schedule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: height 0.3s ease;
}

.schedule-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(102, 126, 234, 0.3) !important;
  border-color: rgb(var(--v-theme-primary));
}

.schedule-card:hover::before {
  height: 6px;
}

.schedule-card .card-header {
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.schedule-card .info-row {
  padding: 8px 0;
  transition: transform 0.2s ease;
}

.schedule-card .info-row:hover {
  transform: translateX(-4px);
}

.schedule-card :deep(.v-card-actions) {
  background: rgba(0, 0, 0, 0.02);
  gap: 8px;
  padding: 12px !important;
}

.schedule-card :deep(.v-card-actions .v-btn) {
  transition: all 0.2s ease;
  font-weight: 500;
}

.schedule-card :deep(.v-card-actions .v-btn:hover) {
  transform: scale(1.05);
}

/* Cards Animation */
.schedule-card {
  animation: cardFadeIn 0.5s ease-out;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for cards */
.schedule-card:nth-child(1) { animation-delay: 0.05s; }
.schedule-card:nth-child(2) { animation-delay: 0.1s; }
.schedule-card:nth-child(3) { animation-delay: 0.15s; }
.schedule-card:nth-child(4) { animation-delay: 0.2s; }
.schedule-card:nth-child(5) { animation-delay: 0.25s; }
.schedule-card:nth-child(6) { animation-delay: 0.3s; }
.schedule-card:nth-child(7) { animation-delay: 0.35s; }
.schedule-card:nth-child(8) { animation-delay: 0.4s; }

/* Responsive adjustments */
@media (max-width: 960px) {
  .page-header {
    padding: 1.5rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-icon :deep(.v-icon) {
    font-size: 28px !important;
  }
  
  .schedule-card .card-header {
    padding: 12px;
  }
  
  .schedule-card :deep(.v-card-text) {
    padding: 12px !important;
  }
}
</style>