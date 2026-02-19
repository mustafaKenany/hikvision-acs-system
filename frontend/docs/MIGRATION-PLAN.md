# 🔄 خطة التحويل من React إلى Vue 3

**التاريخ:** 8 فبراير 2026  
**الحالة:** جاهز للتنفيذ

---

## 📋 المرحلة 1: النسخ الاحتياطي والتحليل

### ✅ الإنجازات:
- [x] تحليل الملفات الموجودة
- [x] تحديد الملفات المفيدة
- [x] إعداد ROADMAP.md بالتقنيات المعتمدة

### 📁 الملفات الحالية (React):

#### **نحتفظ ونعدل:**
- ✅ `vite.config.js` - نغير plugin فقط
- ✅ `package.json` - نعدل dependencies بالكامل
- ✅ `index.html` - تعديلات بسيطة
- ✅ `.gitignore` - ممتاز كما هو
- ✅ `ROADMAP.md` - جاهز ✅
- ✅ `README.md` - نحدثه
- ✅ `eslint.config.js` - نعدله لـ Vue

#### **نقرأ ثم نمسح:**
- 📖 `src/pages/Login.jsx` → نحول لـ `Login.vue`
- 📖 `src/pages/Dashboard.jsx` → نحول لـ `Dashboard.vue`
- 📖 `src/pages/Employees.jsx` → نحول لـ `Employees.vue`
- 📖 `src/components/Layout.jsx` → نحول لـ `AppLayout.vue`
- 📖 `src/contexts/AuthContext.jsx` → نحول لـ Pinia store
- 📖 `src/theme.js` → نستفيد من الألوان

#### **نمسح مباشرة:**
- ❌ `src/` بالكامل (بعد القراءة)
- ❌ `node_modules/`
- ❌ `package-lock.json`
- ❌ `.github/` (اختياري)

---

## 📝 المرحلة 2: إنشاء هيكل Vue 3

### الخطوة 1: تنظيف المجلد
```bash
# نمسح الملفات غير المفيدة
rm -rf node_modules
rm -rf .github
rm package-lock.json
```

### الخطوة 2: تحديث package.json
```json
{
  "name": "hikvision-acs-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js --fix"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vuetify": "^3.5.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@tanstack/vue-query": "^5.0.0",
    "axios": "^1.6.0",
    "vee-validate": "^4.12.0",
    "date-fns": "^3.0.0",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0",
    "vue-advanced-cropper": "^2.8.0",
    "jquery": "^3.7.0",
    "@mdi/font": "^7.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "vite-plugin-vuetify": "^2.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-vue": "^9.20.0",
    "prettier": "^3.2.0"
  }
}
```

### الخطوة 3: تحديث vite.config.js
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

### الخطوة 4: تحديث index.html
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/vite.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام التحكم بالدخول - Hikvision ACS</title>
    
    <!-- Cairo Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### الخطوة 5: إنشاء هيكل src/ جديد
```
src/
├── main.js                    # نقطة البداية
├── App.vue                    # المكون الرئيسي
├── router/
│   └── index.js              # Vue Router config
├── stores/
│   └── auth.js               # Pinia auth store
├── plugins/
│   ├── vuetify.js            # Vuetify setup
│   └── vueQuery.js           # Vue Query setup
├── api/
│   └── axios.js              # Axios instance
├── composables/
│   ├── useAuth.js            # Auth composable
│   └── useApi.js             # API composable
├── components/
│   ├── layout/
│   │   ├── AppBar.vue
│   │   ├── Sidebar.vue
│   │   └── AppLayout.vue
│   └── common/
│       ├── ConfirmDialog.vue
│       └── Snackbar.vue
├── views/
│   ├── Login.vue
│   ├── Dashboard.vue
│   ├── Employees.vue
│   ├── Organizations.vue
│   ├── Devices.vue
│   ├── AccessLogs.vue
│   ├── Users.vue
│   └── Settings.vue
├── utils/
│   └── helpers.js
└── assets/
    └── styles/
        └── main.css
```

---

## 🎯 المرحلة 3: تحويل الكود من React إلى Vue

### أولوية التحويل:

#### **المرحلة 3.1: الملفات الأساسية** ⭐⭐⭐⭐⭐
1. ✅ `src/main.js` - نقطة البداية
2. ✅ `src/App.vue` - المكون الرئيسي
3. ✅ `src/plugins/vuetify.js` - إعداد Vuetify
4. ✅ `src/plugins/vueQuery.js` - إعداد Vue Query
5. ✅ `src/api/axios.js` - Axios instance
6. ✅ `src/router/index.js` - Routing

#### **المرحلة 3.2: Auth System** ⭐⭐⭐⭐⭐
1. ✅ `src/stores/auth.js` - حفظ الـ AuthContext
2. ✅ `src/composables/useAuth.js` - Helper
3. ✅ `src/views/Login.vue` - صفحة تسجيل الدخول

#### **المرحلة 3.3: Layout** ⭐⭐⭐⭐
1. ✅ `src/components/layout/AppLayout.vue`
2. ✅ `src/components/layout/AppBar.vue`
3. ✅ `src/components/layout/Sidebar.vue`

#### **المرحلة 3.4: الصفحات الأساسية** ⭐⭐⭐
1. ✅ `src/views/Dashboard.vue`
2. ✅ `src/views/Employees.vue`

#### **المرحلة 3.5: باقي الصفحات** ⭐⭐
1. ⏳ `src/views/Organizations.vue`
2. ⏳ `src/views/Devices.vue`
3. ⏳ `src/views/AccessLogs.vue`
4. ⏳ `src/views/Users.vue`
5. ⏳ `src/views/Settings.vue`

---

## 🔧 المرحلة 4: Hikvision WebSDK Integration

### الخطوة 1: نسخ SDK Files
```bash
# نسخ ملفات الـ SDK
mkdir -p public/sdk
cp ../../demo/codebase/* public/sdk/
```

### الخطوة 2: إنشاء Device Video Component
```vue
<!-- src/components/device/VideoPlayer.vue -->
<template>
  <v-card>
    <div ref="videoContainer" id="divPlugin" style="height: 500px;"></div>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// ... WebSDK integration
</script>
```

---

## ✅ Checklist التنفيذ

### Phase 1: التنظيف والإعداد
- [ ] نسخ احتياطي للمشروع الحالي
- [ ] حذف node_modules/
- [ ] حذف package-lock.json
- [ ] حذف .github/
- [ ] تحديث package.json
- [ ] تحديث vite.config.js
- [ ] تحديث index.html
- [ ] npm install

### Phase 2: الملفات الأساسية
- [ ] إنشاء src/main.js
- [ ] إنشاء src/App.vue
- [ ] إنشاء src/plugins/vuetify.js
- [ ] إنشاء src/plugins/vueQuery.js
- [ ] إنشاء src/api/axios.js
- [ ] إنشاء src/router/index.js
- [ ] اختبار: npm run dev

### Phase 3: Authentication
- [ ] إنشاء src/stores/auth.js
- [ ] إنشاء src/composables/useAuth.js
- [ ] تحويل Login.jsx إلى Login.vue
- [ ] اختبار تسجيل الدخول

### Phase 4: Layout
- [ ] تحويل Layout.jsx إلى AppLayout.vue
- [ ] إنشاء AppBar.vue
- [ ] إنشاء Sidebar.vue
- [ ] اختبار التنقل

### Phase 5: الصفحات
- [ ] تحويل Dashboard.jsx إلى Dashboard.vue
- [ ] تحويل Employees.jsx إلى Employees.vue
- [ ] إنشاء باقي الصفحات (placeholders)
- [ ] اختبار كل صفحة

### Phase 6: WebSDK Integration
- [ ] نسخ SDK files إلى public/sdk/
- [ ] إنشاء VideoPlayer.vue component
- [ ] اختبار الاتصال بالجهاز
- [ ] اختبار Live Preview

### Phase 7: Testing النهائي
- [ ] اختبار Login/Logout
- [ ] اختبار جميع الصفحات
- [ ] اختبار RTL
- [ ] اختبار Responsive
- [ ] اختبار WebSDK
- [ ] Build للإنتاج

---

## 📊 الجدول الزمني المقترح

| المرحلة | المدة المتوقعة | الحالة |
|---------|-----------------|--------|
| Phase 1: التنظيف والإعداد | 30 دقيقة | ⏳ |
| Phase 2: الملفات الأساسية | 1 ساعة | ⏳ |
| Phase 3: Authentication | 1 ساعة | ⏳ |
| Phase 4: Layout | 1 ساعة | ⏳ |
| Phase 5: الصفحات | 2 ساعات | ⏳ |
| Phase 6: WebSDK Integration | 2 ساعات | ⏳ |
| Phase 7: Testing | 1 ساعة | ⏳ |
| **المجموع** | **8-9 ساعات** | |

---

## 🎯 البداية المقترحة

**نبدأ بـ Phase 1 الآن:**

1. ✅ تحديث package.json
2. ✅ تحديث vite.config.js
3. ✅ تحديث index.html
4. ✅ حذف الملفات القديمة
5. ✅ npm install

**بعدها ننتقل لـ Phase 2:**

إنشاء الملفات الأساسية واحد واحد حتى يشتغل المشروع.

---

**آخر تحديث:** 8 فبراير 2026
