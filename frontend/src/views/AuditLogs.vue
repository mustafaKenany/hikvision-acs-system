<template>
  <div class="pa-4">
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          <v-icon size="large" class="ml-2">mdi-history</v-icon>
          سجل المراجعة والعمليات
        </h1>
        <p class="text-subtitle-1 text-grey mt-2">
          تتبع جميع العمليات والتغييرات في النظام
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="loadLogs"
          :loading="loading"
          variant="outlined"
        >
          تحديث
        </v-btn>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
                <div class="text-subtitle-1">إجمالي العمليات</div>
              </div>
              <v-icon size="48">mdi-chart-line</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.creates }}</div>
                <div class="text-subtitle-1">إضافة</div>
              </div>
              <v-icon size="48">mdi-plus-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.updates }}</div>
                <div class="text-subtitle-1">تحديث</div>
              </div>
              <v-icon size="48">mdi-pencil-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.deletes }}</div>
                <div class="text-subtitle-1">حذف</div>
              </div>
              <v-icon size="48">mdi-delete-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.action"
              label="نوع العملية"
              :items="actionItems"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-filter"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.resource_type"
              label="نوع المورد"
              :items="resourceItems"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-shape"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.start_date"
              label="من تاريخ"
              type="date"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-calendar-start"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.end_date"
              label="إلى تاريخ"
              type="date"
              variant="outlined"
              clearable
              hide-details
              prepend-inner-icon="mdi-calendar-end"
            />
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              color="primary"
              @click="applyFilters"
              prepend-icon="mdi-filter-check"
              class="ml-2"
            >
              تطبيق الفلاتر
            </v-btn>
            <v-btn
              color="grey"
              variant="outlined"
              @click="clearFilters"
              prepend-icon="mdi-filter-off"
            >
              مسح الفلاتر
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Logs Table -->
    <v-card>
      <v-card-title>
        <v-icon class="ml-2">mdi-format-list-bulleted</v-icon>
        السجلات ({{ pagination.total_items }} عملية)
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="logs"
          :loading="loading"
          :items-per-page="pagination.items_per_page"
          hide-default-footer
          class="elevation-1"
        >
          <!-- Action Column -->
          <template #item.action="{ item }">
            <v-chip
              :color="getActionColor(item.action)"
              size="small"
              dark
            >
              <v-icon start size="small">{{ getActionIcon(item.action) }}</v-icon>
              {{ getActionLabel(item.action) }}
            </v-chip>
          </template>

          <!-- Resource Type Column -->
          <template #item.resource_type="{ item }">
            <v-chip
              :color="getResourceColor(item.resource_type)"
              size="small"
              variant="outlined"
            >
              <v-icon start size="small">{{ getResourceIcon(item.resource_type) }}</v-icon>
              {{ getResourceLabel(item.resource_type) }}
            </v-chip>
          </template>

          <!-- Description Column -->
          <template #item.description="{ item }">
            <div class="text-body-2">{{ item.description }}</div>
          </template>

          <!-- User Column -->
          <template #item.user="{ item }">
            <div v-if="item.user" class="d-flex align-center">
              <v-avatar size="24" color="primary" class="ml-2">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">{{ item.user.name }}</div>
                <div class="text-caption text-grey">{{ item.user.email }}</div>
              </div>
            </div>
            <span v-else class="text-grey">غير معروف</span>
          </template>

          <!-- Created At Column -->
          <template #item.created_at="{ item }">
            <div class="text-body-2">{{ formatDateTime(item.created_at) }}</div>
            <div class="text-caption text-grey">{{ formatTimeAgo(item.created_at) }}</div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="viewDetails(item)"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top">عرض التفاصيل</v-tooltip>
            </v-btn>
          </template>
        </v-data-table>

        <!-- Pagination -->
        <div class="d-flex justify-center align-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="pagination.total_pages"
            :total-visible="7"
            @update:modelValue="loadLogs"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card v-if="selectedLog">
        <v-card-title class="bg-primary text-white">
          <v-icon class="ml-2">mdi-information</v-icon>
          تفاصيل العملية
        </v-card-title>

        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">نوع العملية</div>
                <v-chip :color="getActionColor(selectedLog.action)" dark>
                  <v-icon start size="small">{{ getActionIcon(selectedLog.action) }}</v-icon>
                  {{ getActionLabel(selectedLog.action) }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">نوع المورد</div>
                <v-chip :color="getResourceColor(selectedLog.resource_type)" variant="outlined">
                  <v-icon start size="small">{{ getResourceIcon(selectedLog.resource_type) }}</v-icon>
                  {{ getResourceLabel(selectedLog.resource_type) }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">الوصف</div>
                <div class="text-body-1">{{ selectedLog.description }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">المستخدم</div>
                <div v-if="selectedLog.user" class="d-flex align-center">
                  <v-avatar size="32" color="primary" class="ml-2">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ selectedLog.user.name }}</div>
                    <div class="text-caption text-grey">{{ selectedLog.user.email }}</div>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">التاريخ والوقت</div>
                <div class="text-body-2">{{ formatDateTime(selectedLog.created_at) }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6" v-if="selectedLog.ip_address">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">عنوان IP</div>
                <v-chip size="small" variant="outlined">
                  <v-icon start size="small">mdi-ip</v-icon>
                  {{ selectedLog.ip_address }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="6" v-if="selectedLog.resource_id">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">معرف المورد</div>
                <v-chip size="small" variant="outlined">
                  #{{ selectedLog.resource_id }}
                </v-chip>
              </div>
            </v-col>

            <!-- Old Values -->
            <v-col cols="12" v-if="selectedLog.old_values">
              <v-divider class="mb-4" />
              <div class="text-subtitle-2 font-weight-bold mb-2">
                <v-icon class="ml-1">mdi-file-document-outline</v-icon>
                القيم القديمة
              </div>
              <v-card variant="outlined" class="pa-3 bg-grey-lighten-5">
                <pre class="text-caption">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
              </v-card>
            </v-col>

            <!-- New Values -->
            <v-col cols="12" v-if="selectedLog.new_values">
              <v-divider class="mb-4" />
              <div class="text-subtitle-2 font-weight-bold mb-2">
                <v-icon class="ml-1">mdi-file-document</v-icon>
                القيم الجديدة
              </div>
              <v-card variant="outlined" class="pa-3 bg-green-lighten-5">
                <pre class="text-caption">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="detailsDialog = false">
            إغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          إغلاق
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

// State
const loading = ref(false)
const logs = ref([])
const currentPage = ref(1)
const pagination = reactive({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 50
})

const stats = reactive({
  total: 0,
  creates: 0,
  updates: 0,
  deletes: 0
})

const filters = reactive({
  action: null,
  resource_type: null,
  start_date: null,
  end_date: null
})

const detailsDialog = ref(false)
const selectedLog = ref(null)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Items for filters
const actionItems = [
  { title: 'إنشاء', value: 'create' },
  { title: 'تحديث', value: 'update' },
  { title: 'حذف', value: 'delete' },
  { title: 'تفعيل', value: 'activate' },
  { title: 'تعطيل', value: 'deactivate' },
  { title: 'طباعة', value: 'print' },
  { title: 'طباعة متعددة', value: 'print_batch' }
]

const resourceItems = [
  { title: 'منظمة', value: 'organization' },
  { title: 'موظف', value: 'employee' },
  { title: 'جهاز', value: 'device' },
  { title: 'مستخدم', value: 'user' },
  { title: 'تقرير', value: 'report' }
]

// Table headers
const headers = [
  { title: 'العملية', key: 'action', align: 'center', width: '120' },
  { title: 'النوع', key: 'resource_type', align: 'center', width: '120' },
  { title: 'الوصف', key: 'description', align: 'start' },
  { title: 'المستخدم', key: 'user', align: 'start', width: '200' },
  { title: 'التاريخ والوقت', key: 'created_at', align: 'start', width: '180' },
  { title: 'الإجراءات', key: 'actions', align: 'center', sortable: false, width: '80' }
]

// Load logs
const loadLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pagination.items_per_page,
      ...filters
    }

    const response = await axios.get('/audit-logs', { params })
    
    logs.value = response.data.data.logs
    Object.assign(pagination, response.data.data.pagination)
    
    calculateStats()
  } catch (error) {
    console.error('Error loading logs:', error)
    showSnackbar('حدث خطأ أثناء تحميل السجلات', 'error')
  } finally {
    loading.value = false
  }
}

// Calculate statistics
const calculateStats = () => {
  stats.total = pagination.total_items
  stats.creates = logs.value.filter(log => log.action === 'create').length
  stats.updates = logs.value.filter(log => log.action === 'update').length
  stats.deletes = logs.value.filter(log => log.action === 'delete').length
}

// Apply filters
const applyFilters = () => {
  currentPage.value = 1
  loadLogs()
}

// Clear filters
const clearFilters = () => {
  filters.action = null
  filters.resource_type = null
  filters.start_date = null
  filters.end_date = null
  currentPage.value = 1
  loadLogs()
}

// View details
const viewDetails = (log) => {
  selectedLog.value = log
  detailsDialog.value = true
}

// Helper functions
const getActionColor = (action) => {
  const colors = {
    create: 'success',
    update: 'info',
    delete: 'error',
    activate: 'green',
    deactivate: 'orange',
    print: 'purple',
    print_batch: 'deep-purple'
  }
  return colors[action] || 'grey'
}

const getActionIcon = (action) => {
  const icons = {
    create: 'mdi-plus-circle',
    update: 'mdi-pencil-circle',
    delete: 'mdi-delete-circle',
    activate: 'mdi-check-circle',
    deactivate: 'mdi-close-circle',
    print: 'mdi-printer',
    print_batch: 'mdi-printer-check'
  }
  return icons[action] || 'mdi-help-circle'
}

const getActionLabel = (action) => {
  const labels = {
    create: 'إنشاء',
    update: 'تحديث',
    delete: 'حذف',
    activate: 'تفعيل',
    deactivate: 'تعطيل',
    print: 'طباعة',
    print_batch: 'طباعة متعددة',
    update_photo: 'تحديث صورة',
    delete_photo: 'حذف صورة'
  }
  return labels[action] || action
}

const getResourceColor = (type) => {
  const colors = {
    organization: 'blue',
    employee: 'green',
    device: 'orange',
    user: 'purple',
    report: 'teal'
  }
  return colors[type] || 'grey'
}

const getResourceIcon = (type) => {
  const icons = {
    organization: 'mdi-office-building',
    employee: 'mdi-account',
    device: 'mdi-devices',
    user: 'mdi-account-circle',
    report: 'mdi-file-document'
  }
  return icons[type] || 'mdi-file'
}

const getResourceLabel = (type) => {
  const labels = {
    organization: 'منظمة',
    employee: 'موظف',
    device: 'جهاز',
    user: 'مستخدم',
    report: 'تقرير'
  }
  return labels[type] || type
}

const formatDateTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: ar })
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar })
}

const showSnackbar = (text, color) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Lifecycle
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  margin: 0;
}
</style>
