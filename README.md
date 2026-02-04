# 🔐 HikVision Access Control System

<div dir="rtl">

## نظام إدارة الحضور والانصراف بتقنية التعرف على الوجه

> **نظام احترافي متكامل لإدارة الحضور والانصراف للشركات في العراق 🇮🇶**

</div>

---

## 📋 نظرة عامة | Overview

**HikVision Access Control System** هو نظام شامل لإدارة الحضور والانصراف يستخدم تقنية **التعرف على الوجه** من أجهزة HikVision. النظام يوفر واجهة ويب وتطبيق موبايل لإدارة الموظفين، الأجهزة، والتقارير بشكل سهل وفعال.

### ✨ المميزات الرئيسية

- 😊 **التعرف على الوجه** - تسجيل حضور فوري بدون تلامس
- 💳 **دعم متعدد** - بطاقات RFID/NFC، QR Code، البصمة
- ⚡ **Real-time** - تحديثات فورية للحضور والأحداث
- 📱 **Multi-platform** - تطبيق ويب + موبايل
- 🏢 **Multi-tenant** - دعم عدة مؤسسات في نظام واحد
- 📊 **تقارير شاملة** - يومية، شهرية، حسب القسم أو الموظف
- 🌐 **عربي أولاً** - واجهة عربية كاملة مع دعم RTL
- 🔒 **آمن** - JWT authentication + Role-based access
- 📈 **قابل للتوسع** - معماري حديث قابل للنمو

---

## 🎯 الأجهزة المدعومة | Supported Devices

### HikVision Face Recognition Terminals:
- ✅ **DS-K1T673DG1X-E1** (Pro - شاشة 7 إنش)
  - 3,000 وجه
  - 10,000 بطاقة
  - 3,000 بصمة
  
- ✅ **DS-K1T344EBFWX-E1** (Value - شاشة 4.3 إنش)
  - 1,500 وجه
  - 3,000 بطاقة
  - 100,000 سجل

---

## 🏗️ المعمارية | Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│  📱 Mobile App (Flutter)    │  💻 Web App (React/Next)  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ REST API + WebSocket
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Layer                         │
├─────────────────────────────────────────────────────────┤
│  Node.js + Express + Socket.io + Redis + Cron Jobs      │
│  ├─ Authentication (JWT)                                 │
│  ├─ Business Logic Services                             │
│  ├─ ISAPI Client (HikVision Integration)                │
│  └─ Real-time Event Processing                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL + Sequelize ORM                              │
│  └─ 14 tables (multi-tenant architecture)               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Device Layer                            │
├─────────────────────────────────────────────────────────┤
│  HikVision Terminals (ISAPI Protocol over HTTP/HTTPS)   │
│  └─ Face Recognition + Card + Fingerprint               │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ التقنيات المستخدمة | Tech Stack

### Backend:
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18
- **Database:** PostgreSQL 14+
- **ORM:** Sequelize v6.35
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Real-time:** Socket.io v4.6 + WebSocket
- **Caching:** Redis v4.6
- **File Processing:** Multer + Sharp
- **Scheduling:** node-cron
- **Logging:** Winston
- **Testing:** Jest + Supertest

### Frontend (Web):
- **Framework:** React 18 + Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Context API / Zustand
- **HTTP Client:** Axios
- **Charts:** Chart.js / Recharts
- **Forms:** React Hook Form

### Mobile:
- **Framework:** Flutter 3.x
- **State Management:** Provider / Riverpod
- **HTTP Client:** Dio
- **Local Storage:** Hive / Shared Preferences
- **Push Notifications:** Firebase Cloud Messaging

### DevOps:
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Winston
- **SSL:** Let's Encrypt

---

## 📁 البنية المجلدية | Project Structure

```
hikvision-acs-system/
│
├── 📄 README.md                    # هذا الملف
├── 📄 DATABASE_SCHEMA.md           # تصميم قاعدة البيانات
├── 📄 FEATURES.md                  # قائمة الوظائف
├── 📄 REFERENCES.md                # مراجع ISAPI + SDKs
├── 📄 PROJECT_STATUS.md            # حالة المشروع
├── 📄 ROADMAP.md                   # خارطة الطريق
├── 📄 GOLDEN_RULES.md              # قواعد البرمجة
├── 📄 CONTRIBUTING.md              # دليل المساهمة
│
├── backend/                        # Backend (Node.js)
│   ├── src/
│   │   ├── config/                 # Configuration
│   │   ├── models/                 # Sequelize Models
│   │   ├── controllers/            # Request Handlers
│   │   ├── services/               # Business Logic
│   │   │   └── hikvision/
│   │   │       └── ISAPIClient.js  # HikVision Integration ✅
│   │   ├── routes/                 # API Routes
│   │   ├── middleware/             # Middleware
│   │   ├── utils/                  # Utilities
│   │   ├── cron/                   # Cron Jobs
│   │   ├── websocket/              # WebSocket
│   │   ├── migrations/             # DB Migrations
│   │   └── seeders/                # DB Seeders
│   ├── tests/                      # Tests
│   ├── uploads/                    # File Uploads
│   ├── logs/                       # Logs
│   ├── .env.example                # Environment Variables ✅
│   ├── package.json                # Dependencies ✅
│   └── server.js                   # Entry Point ✅
│
├── frontend-web/                   # Web App (Next.js)
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   ├── components/             # React Components
│   │   ├── lib/                    # Utilities
│   │   └── styles/                 # CSS/Tailwind
│   ├── public/                     # Static Files
│   └── package.json
│
├── mobile-app/                     # Mobile App (Flutter)
│   ├── lib/
│   │   ├── screens/                # UI Screens
│   │   ├── widgets/                # Reusable Widgets
│   │   ├── services/               # API Services
│   │   ├── models/                 # Data Models
│   │   └── utils/                  # Utilities
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
└── docker/                         # Docker Files
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── docker-compose.yml
```

---

## 🚀 البدء السريع | Quick Start

### المتطلبات الأساسية | Prerequisites

```bash
# Node.js 18+ و npm
node --version  # v18.0.0+
npm --version   # 9.0.0+

# PostgreSQL 14+
psql --version  # 14.0+

# Redis (اختياري للـ caching)
redis-cli --version  # 6.0+

# Git
git --version
```

### التثبيت | Installation

#### 1. Clone المشروع
```bash
git clone https://github.com/your-username/hikvision-acs-system.git
cd hikvision-acs-system
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**تعديل `.env`:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hikvision_acs
DB_USER=postgres
DB_PASSWORD=your-password

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-me

# Server
PORT=3000
NODE_ENV=development
```

#### 3. إنشاء قاعدة البيانات

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hikvision_acs;

# Exit
\q
```

#### 4. Run Migrations

```bash
# Run migrations (سيتم إنشاءها لاحقاً)
npm run db:migrate

# Seed database with demo data (optional)
npm run db:seed
```

#### 5. تشغيل Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

الـ Backend سيعمل على: `http://localhost:3000`

#### 6. اختبار API

```bash
# Health check
curl http://localhost:3000/health

# Response:
{
  "status": "OK",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "uptime": 123.45
}
```

---

### Frontend Web Setup (قريباً)

```bash
cd frontend-web
npm install
npm run dev
```

### Mobile App Setup (قريباً)

```bash
cd mobile-app
flutter pub get
flutter run
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
جميع الـ endpoints (ماعدا `/auth/login` و `/auth/register`) تحتاج JWT token في الـ header:

```http
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
```http
POST   /api/v1/auth/register          # تسجيل مؤسسة جديدة
POST   /api/v1/auth/login             # تسجيل دخول
POST   /api/v1/auth/logout            # تسجيل خروج
POST   /api/v1/auth/refresh           # تحديث Token
POST   /api/v1/auth/forgot-password   # نسيت كلمة المرور
POST   /api/v1/auth/reset-password    # إعادة تعيين كلمة المرور
```

#### Employees
```http
GET    /api/v1/employees              # قائمة الموظفين
POST   /api/v1/employees              # إضافة موظف
GET    /api/v1/employees/:id          # معلومات موظف
PUT    /api/v1/employees/:id          # تحديث موظف
DELETE /api/v1/employees/:id          # حذف موظف
POST   /api/v1/employees/:id/face     # رفع صورة الوجه
POST   /api/v1/employees/:id/sync     # مزامنة للأجهزة
```

#### Devices
```http
GET    /api/v1/devices                # قائمة الأجهزة
POST   /api/v1/devices                # إضافة جهاز
GET    /api/v1/devices/:id            # معلومات جهاز
PUT    /api/v1/devices/:id            # تحديث جهاز
DELETE /api/v1/devices/:id            # حذف جهاز
POST   /api/v1/devices/:id/test       # اختبار الاتصال
POST   /api/v1/devices/:id/door/open  # فتح الباب
```

#### Attendance
```http
GET    /api/v1/attendance/logs        # سجل الحضور
GET    /api/v1/attendance/summary     # ملخص الحضور
POST   /api/v1/attendance/sync        # مزامنة من الأجهزة
```

#### Reports
```http
GET    /api/v1/reports/daily          # تقرير يومي
GET    /api/v1/reports/monthly        # تقرير شهري
GET    /api/v1/reports/employee/:id   # تقرير موظف
POST   /api/v1/reports/custom         # تقرير مخصص
```

#### Dashboard
```http
GET    /api/v1/dashboard/stats        # إحصائيات عامة
GET    /api/v1/dashboard/charts       # بيانات الرسوم البيانية
GET    /api/v1/dashboard/recent       # أحداث حديثة
```

للحصول على التوثيق الكامل، شاهد: [REFERENCES.md](./REFERENCES.md)

---

## 🔌 WebSocket Events

### الاتصال | Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join organization room
socket.emit('join_organization', { organizationId: '123' });
```

### الأحداث | Events

**From Server:**
```javascript
// حدث حضور جديد
socket.on('attendance_event', (data) => {
  console.log(data);
  // {
  //   employeeNo: '1001',
  //   name: 'أحمد علي',
  //   time: '2026-02-04T08:30:00',
  //   type: 'check-in',
  //   method: 'face',
  //   photo: 'https://...',
  //   deviceName: 'Main Gate'
  // }
});

// تغيير حالة جهاز
socket.on('device_status', (data) => {
  console.log(data);
  // {
  //   deviceId: '123',
  //   status: 'online',
  //   lastSeen: '2026-02-04T08:30:00'
  // }
});

// إشعار جديد
socket.on('notification', (data) => {
  console.log(data);
  // {
  //   type: 'late_arrival',
  //   title: 'موظف متأخر',
  //   message: 'أحمد علي تأخر 15 دقيقة'
  // }
});
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📦 Deployment

### Using Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

```bash
# 1. Build frontend (if applicable)
cd frontend-web
npm run build

# 2. Start backend
cd backend
npm run start

# 3. Use PM2 for process management
npm install -g pm2
pm2 start server.js --name hikvision-backend
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3001; # Next.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 المساهمة | Contributing

نرحب بالمساهمات! يرجى قراءة [CONTRIBUTING.md](./CONTRIBUTING.md) للتفاصيل.

### خطوات المساهمة:

1. Fork المشروع
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👨‍💻 المطور | Developer

**Eng. Mustafa**
- 📧 Email: your-email@example.com
- 🌐 Website: https://yourwebsite.com
- 💼 LinkedIn: https://linkedin.com/in/yourprofile

---

## 🙏 شكر وتقدير | Acknowledgments

- **HikVision** - للأجهزة والبروتوكول ISAPI
- **Node.js Community** - للأدوات والمكتبات الرائعة
- **Contributors** - لكل من ساهم في تطوير المشروع

---

## 📞 الدعم | Support

إذا واجهت أي مشاكل أو كان لديك أسئلة:

- 📝 [فتح Issue](https://github.com/your-username/hikvision-acs-system/issues)
- 📧 Email: support@yourcompany.com
- 💬 Telegram: @yourhandle

---

## 🗺️ الخطط المستقبلية | Roadmap

- [x] Backend API ✅ (قيد التطوير)
- [ ] Web Frontend ⏳
- [ ] Mobile App ⏳
- [ ] Advanced Analytics ⏳
- [ ] Multi-language Support ⏳
- [ ] AI-powered Features 🔮

شاهد [ROADMAP.md](./ROADMAP.md) للتفاصيل الكاملة.

---

## 📊 حالة المشروع | Project Status

**المرحلة الحالية:** MVP Development (Phase 1)  
**التقدم:** 15% ⬛⬛⬜⬜⬜⬜⬜⬜⬜⬜

شاهد [PROJECT_STATUS.md](./PROJECT_STATUS.md) للتفاصيل.

---

## 🔗 روابط مفيدة | Useful Links

- 📚 [التوثيق الكامل](./REFERENCES.md)
- 🎯 [قائمة الميزات](./FEATURES.md)
- 🗺️ [خارطة الطريق](./ROADMAP.md)
- 🌟 [القواعد الذهبية](./GOLDEN_RULES.md)
- 🗄️ [تصميم قاعدة البيانات](./DATABASE_SCHEMA.md)

---

<div align="center">

**صُنع بـ ❤️ في العراق 🇮🇶**

⭐ إذا أعجبك المشروع، لا تنسى النجمة!

</div>
