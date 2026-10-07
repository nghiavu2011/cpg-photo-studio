@echo off
title CPG Photo Studio - Photoshop CC 2020 Edition
echo ========================================================
echo   CPG PHOTO STUDIO 2020 (Photoshop CC 2020 Edition)
echo   Dang khoi dong ung dung...
echo ========================================================

:: Check if server is running on port 8088
netstat -ano | findstr ":8088" >nul
if %errorlevel% neq 0 (
    start /min python -m http.server 8088
    timeout /t 1 /nobreak >nul
)

:: Open default browser
start http://localhost:8088

echo Ung dung da duoc mo tren trinh duyet!
