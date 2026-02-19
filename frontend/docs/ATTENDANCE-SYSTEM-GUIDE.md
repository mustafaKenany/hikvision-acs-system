# نظام إدارة الحضور والانصراف - دليل الاستخدام

## نظرة عامة

تم تطوير نظام شامل لإدارة الحضور والانصراف يتضمن:
- ✅ إدارة جداول الدوام (ثابتة ومرنة)
- ✅ حساب تلقائي للحضور والتأخير والساعات الإضافية
- ✅ تقارير شاملة (يومي، شهري، تأخيرات، ساعات إضافية، غياب)
- ✅ تصدير Excel للتقارير
- ✅ فترات سماح قابلة للتخصيص

---

## 1. جداول الدوام (Work Schedules)

### إنشاء جدول دوام جديد

#### API Endpoint:
```http
POST /api/work-schedules
```

#### Request Body:
```json
{
  "name": "دوام الموظفين الإداريين",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "work_days": [0, 1, 2, 3, 4],
  "expected_hours": 8,
  "late_grace_minutes": 15,
  "early_leave_grace_minutes": 15,
  "break_minutes": 60,
  "half_day_hours": 4,
  "is_flexible": false,
  "is_active": true
}
```

#### معلمات الجدول:
- **name**: اسم الجدول (مطلوب)
- **start_time**: وقت البداية بصيغة HH:MM:SS (مطلوب للدوام الثابت)
- **end_time**: وقت النهاية بصيغة HH:MM:SS (مطلوب للدوام الثابت)
- **work_days**: أرقام أيام العمل [0=أحد، 1=إثنين، ..., 6=سبت] (مطلوب)
- **expected_hours**: عدد الساعات المطلوبة يومياً (مطلوب، من 1 إلى 24)
- **late_grace_minutes**: فترة السماح للتأخير بالدقائق (افتراضي: 15، من 0 إلى 120)
- **early_leave_grace_minutes**: فترة السماح للمغادرة المبكرة (افتراضي: 15)
- **break_minutes**: مدة الاستراحة اليومية (افتراضي: 60 دقيقة)
- **half_day_hours**: عدد ساعات نصف اليوم (افتراضي: 4)
- **is_flexible**: دوام مرن بدون أوقات محددة (افتراضي: false)
- **is_active**: الجدول نشط أم موقوف (افتراضي: true)

### أنواع جداول الدوام

#### 1. دوام ثابت (Fixed Schedule)
- أوقات محددة للبداية والنهاية
- يتم حساب التأخير بناءً على وقت البداية + فترة السماح
- مثال: دوام 8 صباحاً - 5 مساءً، فترة سماح 15 دقيقة

#### 2. دوام مرن (Flexible Schedule)
- بدون أوقات محددة للبداية والنهاية
- يعتمد فقط على إجمالي الساعات المطلوبة
- الموظف يمكنه الحضور في أي وقت
- يتم التحقق فقط من إجمالي الساعات المطلوبة

---

## 2. تعيين الموظفين على جداول الدوام

### API Endpoint:
```http
POST /api/work-schedules/:id/assign-employees
```

### Request Body:
```json
{
  "employee_ids": [1, 2, 3],
  "effective_from": "2024-01-01",
  "effective_until": "2024-12-31"
}
```

### معلمات التعيين:
- **employee_ids**: قائمة معرفات الموظفين (مطلوب)
- **effective_from**: تاريخ بداية التطبيق (مطلوب)
- **effective_until**: تاريخ نهاية التطبيق (اختياري، null = دائم)

---

## 3. حساب الحضور التلقائي

### آلية الحساب:

عند تسجيل حدث دخول/خروج (AttendanceLog)، يتم تلقائياً:

1. **جلب جدول الدوام**: البحث عن الجدول المعين للموظف في هذا التاريخ
2. **حساب التأخير**: 
   - الدوام الثابت: مقارنة وقت الدخول مع start_time + late_grace_minutes
   - الدوام المرن: لا يوجد تأخير (لا يوجد وقت محدد)
3. **حساب المغادرة المبكرة**: مقارنة وقت الخروج مع end_time - early_leave_grace_minutes
4. **حساب ساعات العمل**: 
   - إجمالي الوقت = check_out_time - check_in_time
   - وقت الاستراحة = من سجلات break أو break_minutes من الجدول
   - ساعات العمل = إجمالي الوقت - وقت الاستراحة
5. **حساب الساعات الإضافية**: overtime_hours = max(0, working_hours - expected_hours)
6. **تحديد الحالة**:
   - **present**: حضور كامل (90%+ من الساعات المطلوبة)
   - **late**: متأخر (كامل الساعات لكن تأخر في الدخول)
   - **half_day**: نصف يوم (50%-90% من الساعات)
   - **absent**: غائب (<50% من الساعات أو لا يوجد تسجيل)
   - **holiday**: عطلة (خارج أيام العمل)

### حساب يدوي للحضور

```http
POST /api/reports/attendance/calculate
```

```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "employee_id": 1
}
```

يقوم بإعادة حساب جميع أيام الفترة المحددة للموظف (أو جميع الموظفين إذا لم يحدد employee_id).

---

## 4. التقارير

### 4.1 التقرير اليومي (Daily Report)

```http
GET /api/reports/attendance/daily?date=2024-01-15&organization_id=1
```

**يعرض**: جميع الموظفين في يوم واحد مع تفاصيل حضورهم

**الحقول**:
- الموظف (الاسم، الكود)
- وقت الدخول
- وقت الخروج
- الحالة (present/late/absent/half_day)
- هل متأخر
- دقائق التأخير
- ساعات العمل
- ساعات إضافية
- وقت الاستراحة

**إحصائيات**:
- إجمالي الحضور
- إجمالي المتأخرين
- إجمالي الغياب
- إجمالي الساعات الإضافية

---

### 4.2 التقرير الشهري (Monthly Report)

```http
GET /api/reports/attendance/monthly?year=2024&month=1&organization_id=1
```

**يعرض**: ملخص شهري لجميع الموظفين

**الحقول**:
- الموظف
- أيام الحضور
- أيام التأخير
- أيام الغياب
- أيام نصف يوم
- إجمالي ساعات العمل
- إجمالي الساعات الإضافية
- إجمالي دقائق التأخير
- معدل الحضور (%)

---

### 4.3 تقرير التأخيرات (Late Arrivals)

```http
GET /api/reports/late-arrivals?start_date=2024-01-01&end_date=2024-01-31
```

**يعرض**: جميع حالات التأخير فقط

**الحقول**:
- الموظف
- التاريخ
- وقت الدخول
- دقائق التأخير
- جدول الدوام

**إحصائيات**:
- عدد حالات التأخير
- متوسط دقائق التأخير
- إجمالي دقائق التأخير

---

### 4.4 تقرير الساعات الإضافية (Overtime Report)

```http
GET /api/reports/overtime?start_date=2024-01-01&end_date=2024-01-31
```

**يعرض**: جميع الأيام التي تحتوي على ساعات إضافية

**الحقول**:
- الموظف
- التاريخ
- ساعات العمل
- الساعات المطلوبة
- ساعات إضافية

**إحصائيات**:
- إجمالي الساعات الإضافية
- عدد الأيام
- متوسط الساعات الإضافية

---

### 4.5 تقرير الغياب (Absence Report)

```http
GET /api/reports/absences?start_date=2024-01-01&end_date=2024-01-31
```

**يعرض**: جميع أيام الغياب والنصف يوم

**الحقول**:
- الموظف
- التاريخ
- الحالة (absent/half_day)
- السبب (إن وجد)

**إحصائيات**:
- عدد أيام الغياب الكلي
- عدد أيام النصف
- عدد الموظفين المتأثرين

---

### 4.6 تقرير موظف واحد (Employee Report)

```http
GET /api/reports/attendance/employee/1?year=2024&month=1
```

**يعرض**: تفاصيل حضور موظف واحد لشهر كامل

**الحقول**: جميع التفاصيل اليومية + الملخص الشهري

---

## 5. الفلاتر المتاحة

جميع التقارير تدعم:
- **start_date/end_date**: نطاق التاريخ
- **organization_id**: فلترة حسب المنظمة
- **department_id**: فلترة حسب القسم
- **employee_id**: فلترة حسب موظف معين
- **status**: فلترة حسب الحالة (present/late/absent)
- **page/limit**: pagination

---

## 6. واجهة المستخدم (Frontend)

### 6.1 صفحة جداول الدوام (/work-schedules)

**الميزات**:
- عرض جميع جداول الدوام في جدول
- إضافة جدول دوام جديد (Dialog)
- تعديل جدول موجود
- حذف جدول
- عرض الموظفين المعينين
- تعيين موظفين جدد على الجدول

**الحقول المعروضة**:
- الاسم
- الوقت (من - إلى)
- أيام العمل (Chips)
- الساعات المطلوبة
- فترة السماح
- النوع (ثابت/مرن)
- الحالة (نشط/موقوف)
- الإجراءات

---

### 6.2 صفحة تقارير الحضور (/attendance-reports)

**الميزات**:
- اختيار نوع التقرير (يومي، شهري، تأخيرات، ساعات إضافية، غياب)
- فلاتر متقدمة:
  - نطاق التاريخ (من - إلى)
  - الموظف (autocomplete)
  - القسم (dropdown)
- إحصائيات سريعة (Cards):
  - إجمالي الحضور
  - إجمالي المتأخرين
  - إجمالي الغياب
  - إجمالي الساعات الإضافية
- جدول تفصيلي مع:
  - Colored chips للحالات
  - تنسيق للأرقام والتواريخ
  - Pagination
- أزرار الإجراءات:
  - تطبيق الفلاتر
  - تصدير Excel
  - حساب الحضور يدوياً

---

## 7. أمثلة الاستخدام

### مثال 1: إنشاء دوام ثابت لموظفي الإدارة

```bash
curl -X POST http://localhost:3000/api/work-schedules \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "دوام الإدارة",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "work_days": [0, 1, 2, 3, 4],
  "expected_hours": 8,
  "late_grace_minutes": 15,
  "break_minutes": 60,
  "is_flexible": false,
  "is_active": true
}'
```

### مثال 2: إنشاء دوام مرن

```bash
curl -X POST http://localhost:3000/api/work-schedules \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "دوام مرن",
  "work_days": [0, 1, 2, 3, 4, 5, 6],
  "expected_hours": 8,
  "break_minutes": 60,
  "is_flexible": true,
  "is_active": true
}'
```

### مثال 3: تعيين موظفين

```bash
curl -X POST http://localhost:3000/api/work-schedules/1/assign-employees \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "employee_ids": [1, 2, 3, 4, 5],
  "effective_from": "2024-01-01",
  "effective_until": null
}'
```

### مثال 4: حساب الحضور لشهر كامل

```bash
curl -X POST http://localhost:3000/api/reports/attendance/calculate \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}'
```

### مثال 5: تقرير التأخيرات

```bash
curl -X GET "http://localhost:3000/api/reports/late-arrivals?start_date=2024-01-01&end_date=2024-01-31" \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. جداول قاعدة البيانات

### WorkSchedule (جدول الدوام)
```sql
id, organization_id, name, start_time, end_time, work_days, expected_hours,
late_grace_minutes, early_leave_grace_minutes, break_minutes, half_day_hours,
is_flexible, is_active, created_at, updated_at
```

### EmployeeSchedule (تعيين الموظفين)
```sql
id, employee_id, work_schedule_id, effective_from, effective_until,
is_active, created_at, updated_at
```

### AttendanceSummary (ملخص الحضور اليومي)
```sql
id, employee_id, date, check_in_time, check_out_time, status, is_late,
late_minutes, early_leave_minutes, working_hours, overtime_hours,
break_hours, notes, created_at, updated_at
```

### AttendanceLog (سجلات الأحداث)
```sql
id, employee_id, device_id, event_type (check_in/check_out/break_start/break_end),
event_time, created_at
```

---

## 9. الصلاحيات المطلوبة

- **super_admin**: جميع الصلاحيات
- **admin**: 
  - إدارة جداول الدوام في منظمته
  - تعيين الموظفين
  - عرض جميع التقارير
  - حساب الحضور
- **manager**: 
  - عرض التقارير فقط
  - فلترة حسب قسمه
- **viewer**: 
  - عرض التقارير فقط

---

## 10. ملاحظات مهمة

1. **الحساب التلقائي**: يتم حساب الحضور تلقائياً عند إضافة أي AttendanceLog جديد
2. **فترة السماح**: تطبق على كلا من التأخير والمغادرة المبكرة
3. **الساعات الإضافية**: تُحسب تلقائياً (أي ساعات أكثر من expected_hours)
4. **الدوام المرن**: لا يوجد تأخير، يعتمد فقط على إجمالي الساعات
5. **أيام العطل**: أي يوم خارج work_days يُعتبر عطلة تلقائياً
6. **التقارير**: جميع التقارير تدعم التصدير إلى Excel
7. **الأداء**: التقارير الشهرية تستخدم pagination للأداء الأمثل

---

## 11. الاختبار

تم إنشاء ملف اختبار شامل: `backend/test-work-schedule.js`

```bash
# تشغيل الاختبارات
cd backend
node test-work-schedule.js
```

**السيناريوهات المختبرة**:
1. ✅ Login
2. ✅ Create work schedule
3. ✅ List all schedules
4. ✅ Get schedule by ID
5. ✅ Update schedule
6. ✅ Assign employees
7. ✅ Get schedule employees
8. ✅ Delete schedule

---

## 12. التطوير المستقبلي

- [ ] إشعارات للموظفين المتأخرين
- [ ] تكامل مع منصة الرواتب للساعات الإضافية
- [ ] تقارير رسومات Charts.js
- [ ] تصدير PDF بالإضافة إلى Excel
- [ ] إعدادات الإجازات والعطل الرسمية
- [ ] سياسات مخصصة للحضور

---

## الدعم

لأي استفسارات أو مشاكل، يرجى مراجعة:
- [ROADMAP.md](./ROADMAP.md)
- [MIGRATION-PLAN.md](./MIGRATION-PLAN.md)

تم التطوير بنجاح ✅
