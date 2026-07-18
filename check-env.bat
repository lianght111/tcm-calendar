@echo off
chcp 65001 >nul
echo ============================================
echo   传统中医日历 - 环境检查
echo ============================================
echo.

where node >nul 2>&1 && echo [√] Node.js 已安装 || echo [×] Node.js 未安装
where java >nul 2>&1 && echo [√] Java JDK 已安装 || echo [×] Java JDK 未安装

if defined ANDROID_HOME (
    echo [√] ANDROID_HOME = %ANDROID_HOME%
) else if defined ANDROID_SDK_ROOT (
    echo [√] ANDROID_SDK_ROOT = %ANDROID_SDK_ROOT%
) else (
    echo [×] ANDROID_HOME 未设置
)

echo.
echo --- 建议安装以下工具 ---
echo 1. Java JDK 17+: https://adoptium.net/
echo 2. Android Studio: https://developer.android.com/studio
echo 3. 或 Android SDK 命令行工具: https://developer.android.com/studio#command-line-tools-only
echo.
echo 安装完成后，重新运行 build-apk.bat 即可构建 APK
pause
