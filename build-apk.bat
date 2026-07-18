@echo off
chcp 65001 >nul
echo ============================================
echo   传统中医日历 Android APK 构建脚本
echo ============================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo [√] Node.js 已就绪

:: 检查 Java
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 未找到 Java JDK
    echo 请安装 JDK 17 或更高版本:
    echo 下载地址: https://adoptium.net/
    echo.
)
echo [√] Java JDK 已就绪

:: 检查 Android SDK
if "%ANDROID_HOME%"=="" (
    if "%ANDROID_SDK_ROOT%"=="" (
        echo [警告] 未设置 ANDROID_HOME 环境变量
        echo 建议安装 Android Studio:
        echo 下载地址: https://developer.android.com/studio
        echo 安装后，Android Studio 会自动配置 SDK
        echo.
        echo 或者只安装 Android SDK 命令行工具:
        echo 下载地址: https://developer.android.com/studio#command-line-tools-only
        echo.
    )
)

:: 安装 npm 依赖
echo [1/4] 安装 npm 依赖...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo [错误] npm install 失败
    pause
    exit /b 1
)

:: 生成图标
echo [2/4] 生成应用图标...
call node generate-icons.js

:: 同步 Capacitor
echo [3/4] 同步 Web 资源到 Android 项目...
call npx cap sync

:: 构建 APK
echo [4/4] 构建 APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo.
    echo [提示] 如果构建失败，请确保:
    echo   1. 安装了 JDK 17+
    echo   2. 设置了 ANDROID_HOME 环境变量
    echo   3. 安装了 Android SDK (可通过 Android Studio)
    echo.
    pause
    exit /b 1
)

cd ..
echo.
echo ============================================
echo   构建成功！
echo   APK 文件位置:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================
pause
