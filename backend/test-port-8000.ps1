# Test if port 8000 is accessible on device

Write-Host "`n🧪 Testing Port 8000 on 192.168.1.84...`n" -ForegroundColor Cyan

$result = Test-NetConnection -ComputerName 192.168.1.84 -Port 8000 -WarningAction SilentlyContinue

if ($result.TcpTestSucceeded) {
    Write-Host "✅ البورت 8000 مفتوح وشغال!" -ForegroundColor Green
    Write-Host "`nالآن حدّث قاعدة البيانات:`n" -ForegroundColor Yellow
    Write-Host "  UPDATE devices SET sdk_port = 8000 WHERE ip_address = '192.168.1.84';" -ForegroundColor White
    Write-Host "`nوأعد تشغيل Backend, ثم جرب رفع الصورة.`n" -ForegroundColor Yellow
} else {
    Write-Host "❌ البورت 8000 مغلق أو غير متاح!" -ForegroundColor Red
    Write-Host "`n🔧 الحلول:`n" -ForegroundColor Yellow
    Write-Host "  1. فعّل البورت 8000 في إعدادات الجهاز" -ForegroundColor White
    Write-Host "  2. استخدم SADP Tool لتفعيل البورت" -ForegroundColor White
    Write-Host "  3. تحقق من Firmware - ربما يحتاج تحديث" -ForegroundColor White
    Write-Host "`n📖 دليل كامل: docs/ENABLE-PORT-8000.md`n" -ForegroundColor Cyan
}

# Test other common ports for reference
Write-Host "━" * 50 -ForegroundColor Gray
Write-Host "`n📡 بورتات أخرى على الجهاز:`n" -ForegroundColor Cyan

$ports = @{
    80 = "HTTP/ISAPI"
    443 = "HTTPS"
    554 = "RTSP (Video)"
    8000 = "HCNetSDK (Binary)"
}

foreach ($port in $ports.Keys | Sort-Object) {
    $test = Test-NetConnection -ComputerName 192.168.1.84 -Port $port -WarningAction SilentlyContinue
    $status = if ($test.TcpTestSucceeded) { "✅ Open" } else { "❌ Closed" }
    $service = $ports[$port]
    Write-Host "  Port $port : $status - $service" -ForegroundColor $(if ($test.TcpTestSucceeded) { "Green" } else { "Red" })
}

Write-Host "`n"
