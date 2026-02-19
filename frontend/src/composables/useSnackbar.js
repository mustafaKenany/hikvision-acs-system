import { ref } from 'vue'

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000
})

export function useSnackbar() {
  const showSnackbar = (message, color = 'success', timeout = 3000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout
    }
  }

  const showSuccess = (message) => {
    showSnackbar(message, 'success')
  }

  const showError = (message) => {
    showSnackbar(message, 'error', 5000)
  }

  const showInfo = (message) => {
    showSnackbar(message, 'info')
  }

  const showWarning = (message) => {
    showSnackbar(message, 'warning')
  }

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}
