# Git Push to Gitee Script
# Usage: powershell -ExecutionPolicy Bypass -File push-gitee.ps1

$ErrorActionPreference = "Stop"
$workDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Push to Gitee" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check git
try {
    $gitVersion = & git --version 2>&1
    Write-Host "[OK] Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git not found. Please install Git first." -ForegroundColor Red
    Pause; exit 1
}

# Check remote
$remote = & git remote -v 2>&1
if (-not $remote) {
    Write-Host "[ERROR] No git remote configured." -ForegroundColor Red
    Write-Host "Run: git remote add origin https://gitee.com/YOUR_USER/YOUR_REPO.git" -ForegroundColor Yellow
    Pause; exit 1
}
Write-Host "[OK] Remote:" -ForegroundColor Gray
$remote | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host ""

# Commit message
$msg = Read-Host "Commit message (press Enter for auto)"
if (-not $msg) {
    $msg = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host ""
Write-Host "[1/3] Adding files..." -ForegroundColor Yellow
git add .

Write-Host "[2/3] Committing: $msg" -ForegroundColor Yellow
git commit -m $msg

Write-Host "[3/3] Pushing to Gitee..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "Done! APK can be built via Gitee CI:" -ForegroundColor Green
Write-Host "  https://gitee.com/YOUR_USER/YOUR_REPO/actions" -ForegroundColor Yellow
Pause
