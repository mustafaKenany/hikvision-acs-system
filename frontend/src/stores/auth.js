import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  
  const isAuthenticated = computed(() => !!accessToken.value)
  
  // تحميل البيانات من localStorage عند البداية
  function init() {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    
    if (storedToken && storedUser) {
      accessToken.value = storedToken
      refreshToken.value = storedRefreshToken
      user.value = JSON.parse(storedUser)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
  }
  
  async function login(email, password) {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { user: userData, tokens } = response.data.data
      
      // حفظ البيانات
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken
      user.value = userData
      
      // حفظ في localStorage
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // إعداد axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'حدث خطأ في تسجيل الدخول'
      }
    }
  }
  
  function logout() {
    // مسح البيانات
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    
    // مسح من localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // مسح axios header
    delete axios.defaults.headers.common['Authorization']
  }
  
  // تهيئة عند البداية
  init()
  
  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout
  }
})
