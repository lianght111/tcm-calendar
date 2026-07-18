@echo off
chcp 65001 >nul
echo ============================================
echo   传统中医日历 - 推送到 GitHub
echo ============================================
echo.

:: 让用户输入 GitHub 仓库 URL
set /p GITHUB_REPO="请输入你的 GitHub 仓库地址 (例如: https://github.com/用户名/tcm-calendar.git): "

echo.
echo 正在添加远程仓库...
git remote remove origin 2>nul
git remote add origin %GITHUB_REPO%

echo 正在推送到 GitHub...
git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   推送成功！
    echo   现在去 GitHub Actions 页面运行构建:
    echo   %GITHUB_REPO:.git=/actions%
    echo ============================================
) else (
    echo.
    echo [推送失败] 请检查:
    echo   1. GitHub 仓库地址是否正确
    echo   2. 是否已配置 GitHub 登录凭据
    echo.
    echo 如果未配置凭据，运行以下命令:
    echo   git config --global user.name "你的用户名"
    echo   git config --global user.email "你的邮箱"
    echo.
    echo 然后使用 GitHub 个人访问令牌登录:
    echo   方式1: git credential-manager 会自动弹出登录窗口
    echo   方式2: 使用 SSH key 方式推送
)
pause
