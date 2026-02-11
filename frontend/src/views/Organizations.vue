<template>
  <div class="pa-4">
    <!-- Header -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">
          <v-icon size="large" class="ml-2">mdi-office-building</v-icon>
          المنظمات
        </h1>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
          size="large"
        >
          إضافة منظمة
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
                <div class="text-subtitle-1">إجمالي المنظمات</div>
              </div>
              <v-icon size="48">mdi-office-building-outline</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.active }}</div>
                <div class="text-subtitle-1">نشطة</div>
              </div>
              <v-icon size="48">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.inactive }}</div>
                <div class="text-subtitle-1">غير نشطة</div>
              </div>
              <v-icon size="48">mdi-close-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.totalEmployees }}</div>
                <div class="text-subtitle-1">إجمالي الموظفين</div>
              </div>
              <v-icon size="48">mdi-account-group</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              label="بحث (الاسم، البريد، الهاتف)"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.subscription_plan"
              label="خطة الاشتراك"
              prepend-inner-icon="mdi-crown"
              variant="outlined"
              :items="subscriptionPlans"
              item-title="text"
              item-value="value"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              label="الحالة"
              prepend-inner-icon="mdi-toggle-switch"
              variant="outlined"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              block
              @click="applyFilters"
              height="56"
            >
              <v-icon start>mdi-filter</v-icon>
              تطبيق
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Data Table -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>قائمة المنظمات</span>
        <div>
          <v-btn
            color="success"
            variant="outlined"
            prepend-icon="mdi-file-excel"
            class="ml-2"
            @click="exportToExcel"
          >
            تصدير Excel
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-file-pdf-box"
            @click="exportToPDF"
          >
            تصدير PDF
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredOrganizations"
        :loading="loading"
        loading-text="جاري التحميل..."
        no-data-text="لا توجد بيانات"
        items-per-page="10"
        class="elevation-0"
      >
        <!-- Logo Column -->
        <template #item.logo_url="{ item }">
          <v-avatar size="40" class="my-2">
            <v-img v-if="item.logo_url" :src="getLogoUrl(item.logo_url)" cover />
            <v-icon v-else color="grey">mdi-office-building</v-icon>
          </v-avatar>
        </template>

        <!-- Subscription Plan Column -->
        <template #item.subscription_plan="{ item }">
          <v-chip :color="getSubscriptionColor(item.subscription_plan)" size="small">
            {{ getSubscriptionText(item.subscription_plan) }}
          </v-chip>
        </template>

        <!-- Status Column -->
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
            {{ item.is_active ? 'نشطة' : 'غير نشطة' }}
          </v-chip>
        </template>

        <!-- Subscription End Column -->
        <template #item.subscription_end="{ item }">
          <span v-if="item.subscription_end">
            {{ formatDate(item.subscription_end) }}
          </span>
          <span v-else class="text-grey">-</span>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="عرض التفاصيل">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="info"
                  v-bind="props"
                  @click="viewOrganization(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="تعديل">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  v-bind="props"
                  @click="openEditDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="إدارة الاشتراك">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-crown"
                  size="small"
                  variant="text"
                  color="warning"
                  v-bind="props"
                  @click="openSubscriptionDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.is_active ? 'تعطيل' : 'تفعيل'">
              <template #activator="{ props }">
                <v-btn
                  :icon="item.is_active ? 'mdi-toggle-switch-off' : 'mdi-toggle-switch'"
                  size="small"
                  variant="text"
                  :color="item.is_active ? 'grey' : 'success'"
                  v-bind="props"
                  @click="toggleActivation(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="حذف">
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  v-bind="props"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Organization Dialog -->
    <OrganizationDialog
      v-model="dialogOpen"
      :organization="selectedOrganization"
      @saved="onOrganizationSaved"
    />

    <!-- Subscription Dialog -->
    <SubscriptionDialog
      v-model="subscriptionDialogOpen"
      :organization="selectedOrganization"
      @updated="onSubscriptionUpdated"
    />

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card v-if="selectedOrganization">
        <v-card-title class="bg-info text-white">
          <v-icon start>mdi-information</v-icon>
          تفاصيل المنظمة
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" class="text-center mb-4">
              <v-avatar size="120" class="mb-2">
                <v-img v-if="selectedOrganization.logo_url" :src="getLogoUrl(selectedOrganization.logo_url)" />
                <v-icon v-else size="80" color="grey">mdi-office-building</v-icon>
              </v-avatar>
              <h2>{{ selectedOrganization.name }}</h2>
            </v-col>

            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-email</v-icon>
                  </template>
                  <v-list-item-title>البريد الإلكتروني</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-phone</v-icon>
                  </template>
                  <v-list-item-title>الهاتف</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.phone || 'غير محدد' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-map-marker</v-icon>
                  </template>
                  <v-list-item-title>العنوان</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.address || 'غير محدد' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-crown</v-icon>
                  </template>
                  <v-list-item-title>خطة الاشتراك</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip :color="getSubscriptionColor(selectedOrganization.subscription_plan)" size="small">
                      {{ getSubscriptionText(selectedOrganization.subscription_plan) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>الحد الأقصى للموظفين</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.max_employees }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-devices</v-icon>
                  </template>
                  <v-list-item-title>الحد الأقصى للأجهزة</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.max_devices }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-harddisk</v-icon>
                  </template>
                  <v-list-item-title>مساحة التخزين</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedOrganization.storage_limit_mb }} MB</v-list-item-subtitle>
                </v-list-item>
              </v-list>
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="550">
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          تأكيد الحذف
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="mb-2">
              هل أنت متأكد من حذف المنظمة <strong>{{ organizationToDelete?.name }}</strong>؟
            </div>
            <div class="text-caption">
              <v-icon size="small" class="ml-1">mdi-information</v-icon>
              <strong>ملاحظة:</strong>
              <ul class="mt-2 mr-4">
                <li>إذا كانت المنظمة فارغة (بدون موظفين أو أجهزة) سيتم حذفها نهائياً</li>
                <li>إذا كانت تحتوي على بيانات سيتم تعطيلها بدلاً من الحذف، وسيتم تعطيل جميع الموظفين والأجهزة المرتبطة</li>
              </ul>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false" :disabled="deleting">
            إلغاء
          </v-btn>
          <v-btn color="error" variant="elevated" @click="deleteOrganization" :loading="deleting">
            <v-icon start>mdi-delete</v-icon>
            حذف / تعطيل
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
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
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import OrganizationDialog from '@/components/dialogs/OrganizationDialog.vue'
import SubscriptionDialog from '@/components/dialogs/SubscriptionDialog.vue'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const loading = ref(true)
const organizations = ref([])
const dialogOpen = ref(false)
const subscriptionDialogOpen = ref(false)
const detailsDialog = ref(false)
const selectedOrganization = ref(null)
const deleteDialog = ref(false)
const organizationToDelete = ref(null)
const deleting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Statistics
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  totalEmployees: 0
})

// Filters
const filters = ref({
  search: '',
  subscription_plan: null,
  status: null
})

const subscriptionPlans = [
  { text: 'مجاني', value: 'free' },
  { text: 'أساسي', value: 'basic' },
  { text: 'احترافي', value: 'pro' },
  { text: 'مؤسسي', value: 'enterprise' }
]

const statusOptions = [
  { text: 'نشطة', value: true },
  { text: 'غير نشطة', value: false }
]

const headers = [
  { title: 'الشعار', key: 'logo_url', sortable: false, align: 'center' },
  { title: 'الاسم', key: 'name', align: 'start' },
  { title: 'البريد الإلكتروني', key: 'email' },
  { title: 'الهاتف', key: 'phone' },
  { title: 'خطة الاشتراك', key: 'subscription_plan' },
  { title: 'تاريخ الانتهاء', key: 'subscription_end' },
  { title: 'الحالة', key: 'is_active', align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]

// Computed filtered organizations
const filteredOrganizations = computed(() => {
  let result = organizations.value

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(org => 
      org.name?.toLowerCase().includes(searchLower) ||
      org.email?.toLowerCase().includes(searchLower) ||
      org.phone?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.value.subscription_plan) {
    result = result.filter(org => org.subscription_plan === filters.value.subscription_plan)
  }

  if (filters.value.status !== null && filters.value.status !== undefined) {
    result = result.filter(org => org.is_active === filters.value.status)
  }

  return result
})

// Load organizations
const loadOrganizations = async () => {
  loading.value = true
  console.log('🔄 Loading organizations...')
  try {
    const response = await axios.get('/organizations')
    console.log('✅ Organizations API Response:', response)
    console.log('📦 Response data:', response.data)
    
    // Handle different response formats
    if (response.data.data?.organizations) {
      organizations.value = response.data.data.organizations
      console.log('✅ Format 1: data.data.organizations')
    } else if (response.data.organizations) {
      organizations.value = response.data.organizations
      console.log('✅ Format 2: data.organizations')
    } else if (Array.isArray(response.data)) {
      organizations.value = response.data
      console.log('✅ Format 3: data (array)')
    } else {
      organizations.value = []
      console.log('⚠️ No organizations found in response')
    }
    
    console.log('📊 Loaded organizations count:', organizations.value.length)
    console.log('📋 Organizations:', organizations.value)
    calculateStats()
  } catch (error) {
    console.error('❌ Error loading organizations:', error)
    console.error('❌ Error details:', error.response?.data)
    organizations.value = []
    showSnackbar('حدث خطأ أثناء تحميل البيانات', 'error')
  } finally {
    loading.value = false
    console.log('✅ Loading complete. Count:', organizations.value.length)
  }
}

// Calculate statistics
const calculateStats = () => {
  stats.value.total = organizations.value.length
  stats.value.active = organizations.value.filter(o => o.is_active).length
  stats.value.inactive = organizations.value.filter(o => !o.is_active).length
  stats.value.totalEmployees = organizations.value.reduce((sum, org) => sum + (org.employee_count || 0), 0)
  console.log('📊 Statistics calculated:', stats.value)
}

// Apply filters
const applyFilters = () => {
  showSnackbar('تم تطبيق الفلاتر', 'info')
}

// Export to Excel
const exportToExcel = () => {
  const csv = [
    ['الاسم', 'البريد', 'الهاتف', 'العنوان', 'خطة الاشتراك', 'الحالة'],
    ...filteredOrganizations.value.map(org => [
      org.name,
      org.email,
      org.phone || '',
      org.address || '',
      getSubscriptionText(org.subscription_plan),
      org.is_active ? 'نشطة' : 'غير نشطة'
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `organizations_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  showSnackbar('تم تصدير البيانات إلى Excel', 'success')
}

// Export to PDF
const exportToPDF = () => {
  window.print()
  showSnackbar('جاري طباعة التقرير...', 'info')
}

// Open add dialog
const openAddDialog = () => {
  selectedOrganization.value = null
  dialogOpen.value = true
}

// Open edit dialog
const openEditDialog = (organization) => {
  selectedOrganization.value = { ...organization }
  dialogOpen.value = true
}

// View organization
const viewOrganization = (organization) => {
  selectedOrganization.value = organization
  detailsDialog.value = true
}

// Open subscription dialog
const openSubscriptionDialog = (organization) => {
  selectedOrganization.value = { ...organization }
  subscriptionDialogOpen.value = true
}

// On organization saved
const onOrganizationSaved = () => {
  loadOrganizations()
  showSnackbar('تم حفظ البيانات بنجاح', 'success')
}

// On subscription updated
const onSubscriptionUpdated = () => {
  loadOrganizations()
  showSnackbar('تم تحديث الاشتراك بنجاح', 'success')
}

// Toggle activation
const toggleActivation = async (organization) => {
  try {
    const endpoint = organization.is_active ? 'deactivate' : 'activate'
    await axios.post(`/organizations/${organization.id}/${endpoint}`)
    await loadOrganizations()
    showSnackbar(`تم ${organization.is_active ? 'تعطيل' : 'تفعيل'} المنظمة بنجاح`, 'success')
  } catch (error) {
    console.error('Error toggling activation:', error)
    showSnackbar('حدث خطأ أثناء تغيير الحالة', 'error')
  }
}

// Confirm delete
const confirmDelete = (organization) => {
  console.log('⚠️ Confirm delete for:', organization)
  organizationToDelete.value = organization
  deleteDialog.value = true
}

// Delete organization
const deleteOrganization = async () => {
  if (!organizationToDelete.value) return

  console.log('🗑️ Deleting organization:', organizationToDelete.value)
  deleting.value = true
  try {
    const response = await axios.delete(`/organizations/${organizationToDelete.value.id}`)
    console.log('✅ Delete API response:', response)
    
    // Check the type of deletion
    const resultType = response.data?.data?.type || 'deleted'
    const message = response.data?.data?.message || 'تم حذف المنظمة بنجاح'
    
    const index = organizations.value.findIndex(o => o.id === organizationToDelete.value.id)
    console.log('📍 Found at index:', index)
    
    if (index > -1) {
      if (resultType === 'deleted') {
        // Hard delete - remove from array
        organizations.value.splice(index, 1)
        console.log('✅ Removed from array. New count:', organizations.value.length)
      } else if (resultType === 'deactivated') {
        // Soft delete - update status
        organizations.value[index].is_active = false
        console.log('✅ Deactivated organization')
      }
    }
    
    calculateStats()
    deleteDialog.value = false
    organizationToDelete.value = null
    
    // Show appropriate message
    showSnackbar(message, resultType === 'deleted' ? 'success' : 'info')
    
    // Reload to ensure sync with server
    await loadOrganizations()
  } catch (error) {
    console.error('❌ Error deleting organization:', error)
    console.error('❌ Error response:', error.response?.data)
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف المنظمة'
    showSnackbar(errorMsg, 'error')
    await loadOrganizations()
  } finally {
    deleting.value = false
  }
}

// Get logo URL
const getLogoUrl = (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http')) return logoUrl
  return `http://localhost:3000${logoUrl}`
}

// Get subscription color
const getSubscriptionColor = (plan) => {
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

// Show snackbar
const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  console.log('🚀 Organizations page mounted')
  loadOrganizations()
})
</script>

<style scoped>
@media print {
  .v-btn,
  .v-card-actions {
    display: none !important;
  }
}
</style>
