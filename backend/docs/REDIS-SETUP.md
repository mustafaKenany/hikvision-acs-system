# Redis Setup Guide
## دليل تثبيت وإعداد Redis

---

## 📥 التثبيت على Windows

### الطريقة 1: باستخدام Memurai (موصى به)
Memurai هو Redis مبني خصيصاً لـ Windows

1. **تحميل Memurai:**
   - اذهب إلى: https://www.memurai.com/get-memurai
   - حمّل النسخة المجانية (Developer Edition)
   
2. **التثبيت:**
   - شغّل الملف المحمل
   - اتبع خطوات التثبيت
   - سيشتغل تلقائياً كـ Windows Service

3. **التحقق:**
   ```powershell
   # في PowerShell
   memurai-cli ping
   # المفروض يطلع: PONG
   ```

### الطريقة 2: باستخدام WSL (Windows Subsystem for Linux)
إذا عندك WSL2 مثبت

```bash
# في WSL Terminal
sudo apt update
sudo apt install redis-server

# تشغيل Redis
sudo service redis-server start

# اختبار
redis-cli ping
# المفروض يطلع: PONG
```

### الطريقة 3: باستخدام Docker (الأسهل)
```powershell
# تشغيل Redis في Docker
docker run -d -p 6379:6379 --name redis redis:latest

# اختبار
docker exec -it redis redis-cli ping
# المفروض يطلع: PONG
```

---

## ⚙️ الإعدادات الأساسية

### ملف الإعدادات (redis.conf)

```conf
# Port
port 6379

# Bind to localhost (للتطوير المحلي)
bind 127.0.0.1

# Password (اختياري للتطوير، ضروري للإنتاج)
# requirepass your-strong-password

# Max Memory (حدد حسب جهازك)
maxmemory 256mb

# Eviction Policy (إزالة البيانات القديمة عند امتلاء الذاكرة)
maxmemory-policy allkeys-lru

# Persistence (حفظ البيانات على الديسك)
save 900 1      # بعد 15 دقيقة إذا تغير مفتاح واحد على الأقل
save 300 10     # بعد 5 دقائق إذا تغير 10 مفاتيح
save 60 10000   # بعد 1 دقيقة إذا تغير 10000 مفتاح

# Log Level
loglevel notice

# Log File
logfile "redis-server.log"
```

---

## 🧪 اختبار Redis

### 1. التحقق من التشغيل
```powershell
# Memurai
memurai-cli ping

# Docker
docker exec -it redis redis-cli ping

# WSL
redis-cli ping
```

### 2. اختبار أوامر بسيطة
```bash
# الدخول إلى Redis CLI
redis-cli

# داخل Redis CLI:
> SET test "Hello Redis"
OK

> GET test
"Hello Redis"

> DEL test
(integer) 1

> GET test
(nil)

> EXIT
```

### 3. مراقبة الأوامر الحالية
```bash
# في terminal منفصل
redis-cli MONITOR
```

---

## 🔧 أوامر مفيدة

```bash
# معلومات عن الـ server
redis-cli INFO

# عدد المفاتيح
redis-cli DBSIZE

# حذف كل البيانات (حذر!)
redis-cli FLUSHALL

# الذاكرة المستخدمة
redis-cli INFO memory

# الاتصالات النشطة
redis-cli CLIENT LIST

# إيقاف Redis
redis-cli SHUTDOWN
```

---

## 📊 Redis GUI Tools (اختياري)

للتسهيل، ممكن تستخدم واحد من هذي:

1. **RedisInsight** (مجاني - موصى به)
   - https://redis.com/redis-enterprise/redis-insight/
   - GUI قوي من Redis نفسها
   - Browser, CLI, Profiler

2. **Another Redis Desktop Manager** (مجاني)
   - https://github.com/qishibo/AnotherRedisDesktopManager
   - خفيف وبسيط

3. **Medis** (Mac only)
   - واجهة جميلة

---

## ☁️ Redis على الكلاود

### خيارات الكلاود المقترحة:

#### 1. **AWS ElastiCache** ⭐⭐⭐⭐⭐
- **المميزات:** 
  - أقوى خدمة Redis في السوق
  - High availability مع Multi-AZ
  - Auto-failover
  - Backup تلقائي
- **السعر:** يبدأ من $15-20/شهر (cache.t3.micro)
- **متى تستخدمه:** للمشاريع الكبيرة والـ Enterprise
- **المنطقة:** Bahrain region (me-south-1) - الأقرب للعراق

#### 2. **Azure Cache for Redis** ⭐⭐⭐⭐
- **المميزات:**
  - تكامل ممتاز مع Azure services
  - High availability
  - Global distribution
- **السعر:** يبدأ من $16/شهر (Basic C0)
- **متى تستخدمه:** إذا باقي النظام على Azure
- **المنطقة:** UAE North - قريب للعراق

#### 3. **DigitalOcean Managed Redis** ⭐⭐⭐⭐
- **المميزات:**
  - سهل الاستخدام
  - سعر معقول
  - Performance جيد
- **السعر:** يبدأ من $15/شهر (1GB RAM)
- **متى تستخدمه:** للمشاريع المتوسطة
- **المنطقة:** ممكن Frankfurt أو London

#### 4. **Upstash** ⭐⭐⭐
- **المميزات:**
  - Serverless Redis
  - Pay per request (تدفع على حسب الاستخدام)
  - Free tier كويس (10K requests/day)
- **السعر:** يبدأ من $0 (Free) أو $10/شهر
- **متى تستخدمه:** للبداية أو المشاريع الصغيرة
- **المنطقة:** Global edge

#### 5. **Railway / Render** ⭐⭐⭐
- **المميزات:**
  - سهل جداً
  - Free tier متاح
  - Deploy بـ click واحد
- **السعر:** $0-5/شهر للبداية
- **متى تستخدمه:** للتطوير والاختبار

---

## 🎯 التوصية للمشروع:

### للتطوير الحالي:
```
✅ Memurai أو Docker على جهازك
```

### عند الانتقال للكلاود:

**إذا ميزانية كويسة (Enterprise):**
```
🥇 AWS ElastiCache (Bahrain region)
   + RDS PostgreSQL (Bahrain)
   + EC2/ECS للـ Backend
   = حل متكامل وقوي
   السعر: ~$100-150/شهر
```

**إذا ميزانية متوسطة:**
```
🥈 DigitalOcean
   + Managed Redis ($15/شهر)
   + Managed PostgreSQL ($15/شهر)
   + Droplet للـ Backend ($12/شهر)
   = $42/شهر تقريباً
```

**للبداية/الاختبار:**
```
🥉 Upstash (Redis) + Railway (Backend + DB)
   السعر: $0-20/شهر
```

---

## 🔐 Security للكلاود

عند الصعود للكلاود، لازم:

1. **استخدام Password قوي:**
   ```conf
   requirepass SuperStrongP@ssw0rd!2026
   ```

2. **SSL/TLS Encryption:**
   ```javascript
   // في Node.js
   const redis = new Redis({
     host: 'your-redis.cloud',
     port: 6380,
     password: 'your-password',
     tls: {
       rejectUnauthorized: true
     }
   });
   ```

3. **Firewall Rules:**
   - فقط الـ Backend يقدر يوصل للـ Redis
   - Block كل الـ IPs غير المصرح بها

4. **Connection Pooling:**
   ```javascript
   maxRetriesPerRequest: 3,
   retryStrategy: (times) => Math.min(times * 50, 2000)
   ```

---

## 📝 Next Steps

1. ✅ تثبيت Redis
2. ✅ اختبار الاتصال
3. ⏳ إعداد Backend للاتصال بـ Redis
4. ⏳ تطبيق Caching على APIs
5. ⏳ اختبار الأداء

---

**التحديث الأخير:** 11 فبراير 2026
