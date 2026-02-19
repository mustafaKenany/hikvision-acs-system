<template>
  <v-app>
    <router-view />
    
    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { useSnackbar } from '@/composables/useSnackbar'

const { snackbar } = useSnackbar()
</script>
