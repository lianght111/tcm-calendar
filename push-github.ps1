# Git Push Script
# Usage: powershell -ExecutionPolicy Bypass -File push-github.ps1

$ErrorActionPreference = "Stop"
$workDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workDir

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Push to GitHub" -ForegroundColor Cyan
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
    Write-Host "Run: git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git" -ForegroundColor Yellow
    Pause; exit 1
}
Write-Host "[OK] Remote: $($remote[0])" -ForegroundColor Gray

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

Write-Host "[3/3] Pushing..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Pause
