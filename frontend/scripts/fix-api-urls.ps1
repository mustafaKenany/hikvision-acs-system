# Fix API URLs - Remove duplicate /api/ prefix
# Since baseURL in axios.js is http://localhost:3000/api
# We need to remove /api/ from all axios calls

$frontendPath = "c:\Users\My Laptop\Downloads\WebSDK V3.3.1\hikvision-acs-system\frontend\src"

# Patterns to replace
$patterns = @(
    @{Old = "axios.get\('/api/"; New = "axios.get('/"},
    @{Old = "axios.post\('/api/"; New = "axios.post('/"},
    @{Old = "axios.put\('/api/"; New = "axios.put('/"},
    @{Old = "axios.delete\('/api/"; New = "axios.delete('/"},
    @{Old = "axios.patch\('/api/"; New = "axios.patch('/"},
    @{Old = 'axios.get\(`/api/'; New = 'axios.get(`/'},
    @{Old = 'axios.post\(`/api/'; New = 'axios.post(`/'},
    @{Old = 'axios.put\(`/api/'; New = 'axios.put(`/'},
    @{Old = 'axios.delete\(`/api/'; New = 'axios.delete(`/'},
    @{Old = 'axios.patch\(`/api/'; New = 'axios.patch(`/'}
)

# Get all Vue and JS files
$files = Get-ChildItem -Path $frontendPath -Recurse -Include *.vue,*.js -Exclude node_modules

$changedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0
    
    foreach ($pattern in $patterns) {
        $before = $content
        $content = $content -replace [regex]::Escape($pattern.Old), $pattern.New
        if ($before -ne $content) {
            $matches = ([regex]::Matches($before, [regex]::Escape($pattern.Old))).Count
            $fileChanges += $matches
            Write-Host "  - Replaced $matches occurrences of: $($pattern.Old)" -ForegroundColor Yellow
        }
    }
    
    if ($originalContent -ne $content) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $changedFiles++
        $totalReplacements += $fileChanges
        Write-Host "✅ Fixed: $($file.Name) ($fileChanges changes)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Files changed: $changedFiles" -ForegroundColor Green
Write-Host "   Total replacements: $totalReplacements" -ForegroundColor Green
Write-Host ""
Write-Host "Done! Refresh your browser to see the changes." -ForegroundColor Green
