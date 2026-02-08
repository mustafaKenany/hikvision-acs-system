import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ar } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'ar',
    messages: { ar },
    rtl: { ar: true }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976d2',
          secondary: '#64b5f6',
          accent: '#42a5f5',
          success: '#66bb6a',
          error: '#ef5350',
          warning: '#ffa726',
          info: '#29b6f6',
          background: '#fafafa',
          surface: '#ffffff'
        }
      }
    }
  },
  defaults: {
    global: {
      font: {
        family: 'Cairo, Roboto, sans-serif'
      }
    },
    VBtn: {
      style: 'text-transform: none; font-weight: 600;'
    },
    VCardTitle: {
      style: 'font-weight: 600;'
    },
    VListItemTitle: {
      style: 'font-weight: 600;'
    }
  }
})
