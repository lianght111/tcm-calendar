@echo off
chcp 65001 >nul
echo ============================================
echo   Push to GitHub
echo ============================================
echo.

cd /d "%~dp0"

::: check git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git not found. Please install Git first.
    pause
    exit /b 1
)

::: check remote
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No git remote configured.
    echo Run: git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
    pause
    exit /b 1
)

set /p MSG="Commit message (press Enter for auto): "
if "%MSG%"=="" set "MSG=Update %date% %time%"

echo.
echo [1/3] Adding files...
git add .

echo [2/3] Committing...
git commit -m "%MSG%"

echo [3/3] Pushing...
git push

echo.
echo Done!
pause
