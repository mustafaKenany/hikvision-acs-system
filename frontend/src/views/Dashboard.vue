<template>
  <div>
    <h1 class="text-h4 mb-6">لوحة التحكم</h1>

    <!-- Stats Cards -->
    <v-row>
      <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">{{ stat.title }}</p>
                <h2 class="text-h4">{{ stat.value }}</h2>
              </div>
              <v-avatar :color="stat.color" size="56">
                <v-icon size="32" color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="isLoading" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <p class="mt-4">جاري التحميل...</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

const isLoading = ref(true)
const stats = ref([
  { title: 'إجمالي الموظفين', value: 0, icon: 'mdi-account-group', color: 'primary' },
  { title: 'المنظمات', value: 0, icon: 'mdi-office-building', color: 'secondary' },
  { title: 'الأجهزة', value: 0, icon: 'mdi-devices', color: 'accent' },
  { title: 'الأجهزة النشطة', value: 0, icon: 'mdi-check-circle', color: 'info' }
])

onMounted(async () => {
  try {
    const [employees, organizations, devices] = await Promise.all([
      axios.get('/employees'),
      axios.get('/organizations'),
      axios.get('/devices')
    ])

    stats.value[0].value = employees.data.data.employees?.length || 0
    stats.value[1].value = organizations.data.data.organizations?.length || 0
    stats.value[2].value = devices.data.data.devices?.length || 0
    stats.value[3].value = devices.data.data.devices?.filter(d => d.is_active).length || 0
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
