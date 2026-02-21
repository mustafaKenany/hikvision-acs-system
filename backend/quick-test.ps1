# Quick Test Script - اختبار سريع

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🧪 اختبار سريع للنظام                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Check if Backend is running
Write-Host "1️⃣  فحص Backend...`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Backend شغال على localhost:3000`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend مو شغال!" -ForegroundColor Red
    Write-Host "   ⚠️  محتاج تشغيل Backend:`n" -ForegroundColor Yellow
    Write-Host "      cd backend" -ForegroundColor Gray
    Write-Host "      npm start`n" -ForegroundColor Gray
    Write-Host "   بعد ما يشتغل، شغل هذا السكريبت مرة ثانية.`n" -ForegroundColor White
    exit 1
}

# Step 2: Check C# SDK Service
Write-Host "2️⃣  فحص C# SDK Service...`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ C# Service شغال على localhost:5000`n" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  C# Service مو شغال (مو ضروري للـ ISAPI)" -ForegroundColor Yellow
    Write-Host "   💡 النظام رح يستخدم ISAPI HTTP بدلاً منه`n" -ForegroundColor Cyan
}

# Step 3: Check Device Port 80
Write-Host "3️⃣  فحص الجهاز (192.168.1.84:80)...`n" -ForegroundColor Yellow

$portTest = Test-NetConnection -ComputerName 192.168.1.84 -Port 80 -WarningAction SilentlyContinue

if ($portTest.TcpTestSucceeded) {
    Write-Host "   ✅ الجهاز متصل والبورت 80 مفتوح!`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ ما قدرت أوصل للجهاز على البورت 80" -ForegroundColor Red
    Write-Host "   🔧 تحقق من:`n" -ForegroundColor Yellow
    Write-Host "      • الجهاز شغال؟" -ForegroundColor White
    Write-Host "      • IP صحيح؟ (192.168.1.84)" -ForegroundColor White
    Write-Host "      • الجهاز بنفس الشبكة؟`n" -ForegroundColor White
    exit 1
}

# Step 4: Check Database Configuration
Write-Host "4️⃣  فحص إعدادات الجهاز في Database...`n" -ForegroundColor Yellow

try {
    $result = node -e "import pkg from 'pg'; const {Pool} = pkg; const pool = new Pool({host:'localhost',database:'hikvision_acs_dev',user:'postgres',password:'123',port:5432}); pool.query('SELECT id,name,ip_address,sdk_port FROM devices WHERE ip_address=''192.168.1.84''').then(r=>{if(r.rows.length>0){console.log(JSON.stringify(r.rows[0]))}else{console.log('NOT_FOUND')}pool.end()}).catch(e=>{console.log('ERROR');pool.end()});" 2>$null
    
    if ($result -eq "NOT_FOUND") {
        Write-Host "   ⚠️  الجهاز مو موجود في Database!" -ForegroundColor Red
        Write-Host "   💡 روح للنظام وضيف الجهاز أولاً`n" -ForegroundColor Yellow
    } elseif ($result -eq "ERROR") {
        Write-Host "   ⚠️  ما قدرت أتصل بـ Database" -ForegroundColor Yellow
        Write-Host "   💡 تأكد من PostgreSQL شغال`n" -ForegroundColor Gray
    } else {
        $device = $result | ConvertFrom-Json
        Write-Host "   ✅ الجهاز موجود في Database:" -ForegroundColor Green
        Write-Host "      • Name: $($device.name)" -ForegroundColor White
        Write-Host "      • IP: $($device.ip_address)" -ForegroundColor White
        Write-Host "      • SDK Port: $($device.sdk_port)" -ForegroundColor $(if ($device.sdk_port -eq 80) { "Green" } else { "Yellow" })
        
        if ($device.sdk_port -eq 80) {
            Write-Host "      🎯 النظام رح يستخدم ISAPI HTTP API ✅`n" -ForegroundColor Green
        } else {
            Write-Host "      🎯 النظام رح يستخدم SDK Binary Protocol`n" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ⚠️  ما قدرت أفحص Database" -ForegroundColor Yellow
}

# Summary
Write-Host "━" * 60 -ForegroundColor Gray
Write-Host "`n✅ الفحص الأولي انتهى!`n" -ForegroundColor Green
Write-Host "🚀 الخطوة التالية:`n" -ForegroundColor Cyan
Write-Host "   1. افتح المتصفح: http://localhost:5173" -ForegroundColor White
Write-Host "   2. روح لـ Employees" -ForegroundColor White
Write-Host "   3. اختر موظف → Face Registration" -ForegroundColor White
Write-Host "   4. اختر الجهاز: test (192.168.1.84)" -ForegroundColor White
Write-Host "   5. ارفع صورة واضغط Register ✨`n" -ForegroundColor Green
Write-Host "━" * 60 -ForegroundColor Gray
Write-Host "`n💬 بعد ما تجرب، خبرني شصار!`n" -ForegroundColor Yellow
