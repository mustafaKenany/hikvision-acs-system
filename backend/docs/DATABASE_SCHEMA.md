# HikVision Access Control System - Database Schema

## Overview
نظام متكامل لإدارة الحضور والانصراف باستخدام أجهزة HikVision Face Recognition

---

## 📊 Database Tables

### 1. **organizations** (الشركات/المؤسسات)
Multi-tenant support - كل شركة ببياناتها

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT org_name_unique UNIQUE(name)
);

CREATE INDEX idx_orgs_active ON organizations(is_active);
```

---

### 2. **users** (المستخدمين - Admins/Managers)
مدراء النظام

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- super_admin, org_admin, manager, viewer
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT users_email_unique UNIQUE(email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
```

---

### 3. **devices** (أجهزة HikVision)
إدارة الأجهزة المتصلة

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_model VARCHAR(100), -- DS-K1T673DG1X-E1, DS-K1T344EBFWX-E1
    device_serial VARCHAR(100) UNIQUE,
    ip_address VARCHAR(50) NOT NULL,
    port INTEGER DEFAULT 80,
    username VARCHAR(100) NOT NULL,
    password_encrypted TEXT NOT NULL, -- encrypted password
    location VARCHAR(255), -- موقع الجهاز (مدخل رئيسي، باب خلفي، إلخ)
    is_online BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMP,
    firmware_version VARCHAR(50),
    supports_face BOOLEAN DEFAULT true,
    supports_card BOOLEAN DEFAULT true,
    supports_fingerprint BOOLEAN DEFAULT false,
    supports_qr BOOLEAN DEFAULT true,
    max_face_capacity INTEGER DEFAULT 3000,
    current_face_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance, error
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT device_ip_unique UNIQUE(organization_id, ip_address)
);

CREATE INDEX idx_devices_org ON devices(organization_id);
CREATE INDEX idx_devices_online ON devices(is_online);
CREATE INDEX idx_devices_status ON devices(status);
```

---

### 4. **employees** (الموظفين)
بيانات الموظفين

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL, -- كود الموظف
    full_name VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    national_id VARCHAR(50),
    hire_date DATE,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT emp_code_unique UNIQUE(organization_id, employee_code)
);

CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_employees_dept ON employees(organization_id, department);
```

---

### 5. **face_templates** (بيانات الوجوه)
Face templates المخزنة على الجهاز

```sql
CREATE TABLE face_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    face_id VARCHAR(100), -- ID على الجهاز
    face_data BYTEA, -- Template data (optional - للنسخ الاحتياطي)
    photo_url TEXT, -- صورة الوجه
    quality_score INTEGER, -- 0-100
    is_synced BOOLEAN DEFAULT false, -- هل تم رفعه للجهاز؟
    synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT face_emp_device_unique UNIQUE(employee_id, device_id)
);

CREATE INDEX idx_faces_employee ON face_templates(employee_id);
CREATE INDEX idx_faces_device ON face_templates(device_id);
CREATE INDEX idx_faces_synced ON face_templates(is_synced);
```

---

### 6. **card_templates** (بطاقات الدخول)

```sql
CREATE TABLE card_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    card_number VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) DEFAULT 'rfid', -- rfid, qr, nfc
    is_active BOOLEAN DEFAULT true,
    is_synced BOOLEAN DEFAULT false,
    synced_at TIMESTAMP,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT card_number_unique UNIQUE(card_number)
);

CREATE INDEX idx_cards_employee ON card_templates(employee_id);
CREATE INDEX idx_cards_device ON card_templates(device_id);
CREATE INDEX idx_cards_active ON card_templates(is_active);
```

---

### 7. **fingerprint_templates** (بصمات الإصبع)

```sql
CREATE TABLE fingerprint_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    fingerprint_id VARCHAR(100),
    finger_index INTEGER, -- 0-9 (أصابع اليد)
    template_data BYTEA,
    quality_score INTEGER,
    is_synced BOOLEAN DEFAULT false,
    synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fingerprints_employee ON fingerprint_templates(employee_id);
CREATE INDEX idx_fingerprints_device ON fingerprint_templates(device_id);
```

---

### 8. **attendance_logs** (سجلات الحضور)
أهم جدول - السجلات الحية

```sql
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    event_time TIMESTAMP NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- check_in, check_out, denied
    verification_method VARCHAR(50), -- face, card, fingerprint, qr, password
    person_name VARCHAR(255), -- من بيانات الجهاز
    person_id VARCHAR(100), -- ID على الجهاز
    temperature DECIMAL(4,1), -- درجة الحرارة (إن وجدت)
    mask_detected BOOLEAN, -- كمامة؟
    photo_url TEXT, -- صورة الحدث
    location VARCHAR(255), -- موقع الدخول
    is_synced BOOLEAN DEFAULT false,
    raw_data JSONB, -- البيانات الخام من الجهاز
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT attendance_event_time_check CHECK (event_time <= NOW())
);

CREATE INDEX idx_attendance_org ON attendance_logs(organization_id);
CREATE INDEX idx_attendance_emp ON attendance_logs(employee_id);
CREATE INDEX idx_attendance_device ON attendance_logs(device_id);
CREATE INDEX idx_attendance_time ON attendance_logs(event_time DESC);
CREATE INDEX idx_attendance_type ON attendance_logs(event_type);
CREATE INDEX idx_attendance_date ON attendance_logs(DATE(event_time));
```

---

### 9. **attendance_summary** (ملخص الحضور اليومي)
Materialized view للتقارير السريعة

```sql
CREATE TABLE attendance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    first_check_in TIMESTAMP,
    last_check_out TIMESTAMP,
    total_hours DECIMAL(5,2),
    is_late BOOLEAN DEFAULT false, -- متأخر؟
    late_minutes INTEGER DEFAULT 0,
    is_early_leave BOOLEAN DEFAULT false, -- مغادرة مبكرة؟
    early_leave_minutes INTEGER DEFAULT 0,
    is_absent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT summary_emp_date_unique UNIQUE(employee_id, date)
);

CREATE INDEX idx_summary_org_date ON attendance_summary(organization_id, date DESC);
CREATE INDEX idx_summary_emp ON attendance_summary(employee_id);
CREATE INDEX idx_summary_late ON attendance_summary(is_late) WHERE is_late = true;
CREATE INDEX idx_summary_absent ON attendance_summary(is_absent) WHERE is_absent = true;
```

---

### 10. **work_schedules** (جداول العمل)

```sql
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    start_time TIME NOT NULL, -- 08:00:00
    end_time TIME NOT NULL, -- 17:00:00
    grace_period_minutes INTEGER DEFAULT 15, -- فترة السماح
    work_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_org ON work_schedules(organization_id);
```

---

### 11. **employee_schedules** (ربط الموظف بجدول العمل)

```sql
CREATE TABLE employee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES work_schedules(id) ON DELETE CASCADE,
    effective_from DATE NOT NULL,
    effective_until DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT emp_schedule_unique UNIQUE(employee_id, effective_from)
);

CREATE INDEX idx_emp_schedules_emp ON employee_schedules(employee_id);
```

---

### 12. **notifications** (الإشعارات)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- late_arrival, absence, device_offline, unauthorized_access
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    related_entity_type VARCHAR(50), -- employee, device, attendance
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifs_user ON notifications(user_id);
CREATE INDEX idx_notifs_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifs_created ON notifications(created_at DESC);
```

---

### 13. **audit_logs** (سجلات التدقيق)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- create_employee, delete_face, update_device
    entity_type VARCHAR(50), -- employee, device, user
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

### 14. **system_settings** (إعدادات النظام)

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT settings_org_key_unique UNIQUE(organization_id, setting_key)
);

CREATE INDEX idx_settings_org ON system_settings(organization_id);
```

---

## 🔐 Default Settings (Examples)

```json
{
  "late_threshold_minutes": 15,
  "auto_checkout_time": "18:00:00",
  "require_mask": false,
  "temperature_check_enabled": false,
  "max_temperature": 37.5,
  "notification_channels": ["email", "push", "sms"],
  "realtime_sync_enabled": true,
  "timezone": "Asia/Baghdad"
}
```

---

## 📈 Views for Reports

### Daily Attendance Summary View
```sql
CREATE VIEW v_daily_attendance AS
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    e.department,
    DATE(al.event_time) as date,
    MIN(CASE WHEN al.event_type = 'check_in' THEN al.event_time END) as first_check_in,
    MAX(CASE WHEN al.event_type = 'check_out' THEN al.event_time END) as last_check_out
FROM employees e
LEFT JOIN attendance_logs al ON e.id = al.employee_id
GROUP BY e.id, e.employee_code, e.full_name, e.department, DATE(al.event_time);
```

---

## 🚀 Indexes Summary

تم إنشاء Indexes على:
- ✅ Foreign Keys
- ✅ Frequently queried columns (organization_id, date, status)
- ✅ Boolean fields للـfiltering
- ✅ Timestamp fields للترتيب

---

## 💾 Storage Estimates

**لشركة متوسطة (100 موظف):**
- Employees: ~100 KB
- Face Templates: ~50 MB (صور عالية الجودة)
- Attendance Logs: ~10 MB/شهر
- Total: ~150 MB سنوياً

**قابل للتوسع لـ10,000 موظف بسهولة**

---

## 🔄 Data Flow

```
Device Event → Backend API → Database (attendance_logs)
                          ↓
                    Process & Aggregate
                          ↓
              Update attendance_summary
                          ↓
                  Check Rules & Alerts
                          ↓
              Create notifications if needed
```

---

**Next Steps:**
1. ✅ Create migration files
2. ✅ Setup PostgreSQL
3. ✅ Build Backend API
4. ✅ Implement Real-time WebSocket
