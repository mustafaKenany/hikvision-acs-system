import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/employees',
          name: 'employees',
          component: () => import('@/views/Employees.vue')
        },
        {
          path: '/organizations',
          name: 'organizations',
          component: () => import('@/views/Organizations.vue')
        },
        {
          path: '/devices',
          name: 'devices',
          component: () => import('@/views/Devices.vue')
        },
        {
          path: '/access-logs',
          name: 'access-logs',
          component: () => import('@/views/AccessLogs.vue')
        },
        {
          path: '/users',
          name: 'users',
          component: () => import('@/views/Users.vue')
        },
        {
          path: '/audit-logs',
          name: 'audit-logs',
          component: () => import('@/views/AuditLogs.vue'),
          meta: { requiresSuperAdmin: true }
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
