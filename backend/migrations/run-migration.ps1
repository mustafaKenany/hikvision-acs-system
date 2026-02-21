# 🔧 إضافة حقل SDK Port لجدول Devices
# يسمح لك بتحديد البورت الخاص بكل جهاز

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  🔧 إضافة SDK Port للأجهزة" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

# Database connection info
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "hikvision_acs_dev"
$DB_USER = "postgres"

# Read password from .env or ask user
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (Test-Path $envFile) {
    $dbPassword = (Get-Content $envFile | Where-Object { $_ -match '^DB_PASSWORD=' }) -replace 'DB_PASSWORD=', ''
    Write-Host "✅ قرأت كلمة السر من .env" -ForegroundColor Green
} else {
    $dbPassword = Read-Host "أدخل كلمة سر PostgreSQL" -AsSecureString
    $dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

Write-Host "`n📊 معلومات قاعدة البيانات:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   Port: $DB_PORT" -ForegroundColor Gray
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   User: $DB_USER`n" -ForegroundColor Gray

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL client (psql) غير موجود!" -ForegroundColor Red
    Write-Host "`nالحل:" -ForegroundColor Yellow
    Write-Host "1. شغّل pgAdmin 4 وافتح Query Tool" -ForegroundColor White
    Write-Host "2. انسخ محتوى الملف:" -ForegroundColor White
    Write-Host "   backend/migrations/add-sdk-port-to-devices.sql" -ForegroundColor Cyan
    Write-Host "3. شغّل السكريبت في Query Tool`n" -ForegroundColor White
    exit 1
}

Write-Host "🚀 تطبيق التغييرات على قاعدة البيانات...`n" -ForegroundColor Cyan

# Run the migration
$sqlFile = Join-Path $PSScriptRoot "add-sdk-port-to-devices.sql"

if (Test-Path $sqlFile) {
    try {
        # Execute the SQL file
        $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم تطبيق التغييرات بنجاح!`n" -ForegroundColor Green
            
            # Show current devices
            Write-Host "📋 الأجهزة الحالية:`n" -ForegroundColor Yellow
            & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, name, ip_address, port as http_port, sdk_port FROM devices;"
            
            Write-Host "`n============================================" -ForegroundColor Cyan
            Write-Host "  ✅ الإعدادات الجديدة" -ForegroundColor Green
            Write-Host "============================================" -ForegroundColor Cyan
            Write-Host "`nجميع الأجهزة الآن تستخدم sdk_port = 8000`n" -ForegroundColor White
            
            Write-Host "⚙️  لتغيير البورت لجهاز معين:" -ForegroundColor Yellow
            Write-Host "   UPDATE devices SET sdk_port = 80 WHERE ip_address = '192.168.1.84';`n" -ForegroundColor Cyan
            
            Write-Host "🔄 الخطوة التالية:" -ForegroundColor Magenta
            Write-Host "   1. أعد تشغيل Backend (Ctrl+C ثم npm start)" -ForegroundColor White
            Write-Host "   2. جرب رفع صورة مرة ثانية`n" -ForegroundColor White
            
        } else {
            Write-Host "❌ فشل تطبيق التغييرات!" -ForegroundColor Red
            Write-Host "`nالخطأ:" -ForegroundColor Yellow
            Write-Host $result -ForegroundColor Red
            Write-Host "`nجرب تشغيل السكريبت يدوياً في pgAdmin`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ خطأ: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ ملف SQL غير موجود: $sqlFile" -ForegroundColor Red
}

# Clear password
$env:PGPASSWORD = ""

Write-Host "`n============================================`n" -ForegroundColor Cyan
