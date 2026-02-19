# Hikvision ACS System - Frontend

نظام إدارة التحكم بالدخول من Hikvision مع نظام شامل للحضور والانصراف.

## 🚀 الميزات

### الميزات الأساسية
- ✅ إدارة الموظفين والمنظمات
- ✅ إدارة الأجهزة واكتشافها
- ✅ سجلات الدخول والخروج
- ✅ نظام المراجعة (Audit Logs)
- ✅ إدارة المستخدمين والصلاحيات
- ✅ تسجيل الوجه والبطاقات

### نظام الحضور والانصراف الجديد 🆕
- ✅ إدارة جداول الدوام (ثابتة ومرنة)
- ✅ حساب تلقائي للحضور والتأخير
- ✅ حساب الساعات الإضافية تلقائياً
- ✅ فترات سماح قابلة للتخصيص
- ✅ تقارير شاملة (يومي، شهري، تأخيرات، ساعات إضافية، غياب)
- ✅ تصدير التقارير إلى Excel
- ✅ إحصائيات فورية

## 🛠️ التقنيات المستخدمة

- **Vue 3** - Composition API
- **Vuetify 3** - Material Design Components
- **Pinia** - State Management
- **Vue Router 4** - Routing
- **Axios** - HTTP Client
- **date-fns** - Date Manipulation
- **XLSX** - Excel Export
- **Chart.js** - Data Visualization

## 📦 التثبيت

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 متغيرات البيئة

أنشئ ملف `.env` في الجذر:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📂 هيكل المشروع

```
src/
├── api/              # Axios config & API clients
├── assets/           # Static assets (CSS, images)
├── components/       # Vue components
│   ├── dialogs/     # Reusable dialogs
│   └── layout/      # Layout components (AppLayout, etc.)
├── composables/     # Composition API utilities
├── plugins/         # Vue plugins (Vuetify, etc.)
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
├── utils/           # Utility functions
├── views/           # Page components
├── App.vue          # Root component
└── main.js          # Entry point
```

## 🔐 الصلاحيات

النظام يدعم 4 مستويات من الصلاحيات:
- **super_admin**: كامل الصلاحيات على جميع المنظمات
- **admin**: كامل الصلاحيات على منظمته فقط
- **manager**: عرض وحذف فقط
- **viewer**: عرض فقط

## 📄 الصفحات المتاحة

| المسار | الوصف |
|--------|-------|
| `/` | لوحة التحكم الرئيسية |
| `/employees` | إدارة الموظفين |
| `/organizations` | إدارة المنظمات |
| `/devices` | إدارة الأجهزة |
| `/work-schedules` | إدارة جداول الدوام 🆕 |
| `/attendance-reports` | تقارير الحضور والانصراف 🆕 |
| `/access-logs` | سجلات الدخول |
| `/audit-logs` | سجل المراجعة |
| `/users` | إدارة المستخدمين |
| `/settings` | الإعدادات |
| `/login` | تسجيل الدخول |

## 📚 الوثائق

- [دليل نظام الحضور والانصراف](./ATTENDANCE-SYSTEM-GUIDE.md)
- [توثيق الـ APIs](./API-ENDPOINTS.md)
- [خطة الترحيل](./MIGRATION-PLAN.md)
- [خارطة الطريق](./ROADMAP.md)

## 🔧 التطوير

### كتابة مكون جديد

```vue
<template>
  <v-container>
    <!-- Your content -->
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/api/axios'

const data = ref([])

const loadData = async () => {
  const response = await axios.get('/endpoint')
  data.value = response.data.data
}
</script>
```

### استخدام Composables

```javascript
import { useSnackbar } from '@/composables/useSnackbar'

const { showSuccess, showError } = useSnackbar()

showSuccess('تمت العملية بنجاح')
showError('حدث خطأ')
```

### State Management

```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
console.log(authStore.user)
authStore.logout()
```

## 🧪 الاختبار

```bash
# Run backend tests
cd ../backend
node test-work-schedule.js
```

## 📝 أمثلة الاستخدام

### تصدير Excel

```javascript
import * as XLSX from 'xlsx'

const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, 'export.xlsx')
}
```

### تنسيق التواريخ

```javascript
import { format, parseISO } from 'date-fns'

const formattedDate = format(parseISO('2024-01-15'), 'dd/MM/yyyy')
const formattedTime = format(parseISO('2024-01-15T08:30:00'), 'HH:mm')
```

## 🐛 استكشاف الأخطاء

### مشكلة CORS
تأكد من إعداد Backend بشكل صحيح:
```javascript
// backend/src/index.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### مشكلة التوثيق
تأكد من إرسال token في headers:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
```

## 📞 الدعم

لأي استفسارات:
- افتح issue في GitHub
- راجع الوثائق في `ATTENDANCE-SYSTEM-GUIDE.md`

## 📄 الرخصة

Private - All rights reserved

---

**تم التطوير بواسطة**: فريق Hikvision ACS  
**آخر تحديث**: يناير 2024  
**النسخة**: 1.0.0

