<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" elevation="2" prominent dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-toolbar-title class="font-weight-bold">
        {{ pageTitle }}
      </v-toolbar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="secondary" size="40">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title class="font-weight-bold">
              {{ authStore.user?.full_name || 'مستخدم' }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ authStore.user?.email }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider />

          <v-list-item @click="handleLogout">
            <template #prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>تسجيل الخروج</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="$vuetify.display.mdAndUp"
      width="280"
      color="white"
      elevation="1"
    >
      <!-- Logo Section -->
      <div class="pa-4 mb-2">
        <h2 class="text-h6 text-primary font-weight-bold text-center">
          🏢 نظام التحكم بالدخول
        </h2>
        <p class="text-caption text-center text-medium-emphasis mt-1">
          Hikvision ACS
        </p>
      </div>

      <v-divider />

      <v-list density="comfortable" nav class="pa-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="xl"
          color="primary"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const drawer = ref(true)

const menuItems = [
  { title: 'لوحة التحكم', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'الموظفون', icon: 'mdi-account-group', to: '/employees' },
  { title: 'المنظمات', icon: 'mdi-office-building', to: '/organizations' },
  { title: 'الأجهزة', icon: 'mdi-devices', to: '/devices' },
  { title: 'جداول الدوام', icon: 'mdi-calendar-clock', to: '/work-schedules' },
  { title: 'تقارير الحضور', icon: 'mdi-chart-box', to: '/attendance-reports' },
  { title: 'سجلات الدخول', icon: 'mdi-login', to: '/access-logs' },
  { title: 'سجل المراجعة', icon: 'mdi-history', to: '/audit-logs' },
  { title: 'المستخدمون', icon: 'mdi-account-cog', to: '/users' },
  { title: 'الإعدادات', icon: 'mdi-cog', to: '/settings' }
]

const pageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.to === route.path)
  return currentItem?.title || 'لوحة التحكم'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
