<template>
  <v-app>
    <v-main class="login-bg">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card elevation="10" rounded="lg">
              <v-card-text class="pa-8">
                <!-- Logo & Title -->
                <div class="text-center mb-6">
                  <h1 class="text-h4 font-weight-bold mb-2">
                    🏢 نظام التحكم بالدخول
                  </h1>
                  <p class="text-caption text-medium-emphasis">
                    Hikvision Access Control System
                  </p>
                </div>

                <!-- Error Alert -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4"
                  closable
                  @click:close="error = ''"
                >
                  {{ error }}
                </v-alert>

                <!-- Login Form -->
                <v-form @submit.prevent="handleLogin" ref="formRef">
                  <v-text-field
                    v-model="email"
                    label="البريد الإلكتروني"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    :rules="[rules.required, rules.email]"
                    required
                    autofocus
                    class="mb-2"
                  />

                  <v-text-field
                    v-model="password"
                    :label="'كلمة المرور'"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    :rules="[rules.required]"
                    required
                    class="mb-4"
                  />

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="loading"
                  >
                    <v-icon start>mdi-login</v-icon>
                    تسجيل الدخول
                  </v-btn>
                </v-form>

                <!-- Credentials Hint -->
                <v-divider class="my-4" />
                <div class="text-center text-caption text-medium-emphasis">
                  <p>بيانات تجريبية:</p>
                  <p>admin@demo.test / Admin@123</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@demo.test')
const password = ref('Admin@123')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const formRef = ref(null)

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  email: v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صحيح'
}

const handleLogin = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  error.value = ''
  loading.value = true

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push({ name: 'dashboard' })
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%);
  min-height: 100vh;
}
</style>
