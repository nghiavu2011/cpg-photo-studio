@echo off
title CPG Photo Studio CC 2020
echo ========================================================
echo   CPG PHOTO STUDIO 2020 (Photoshop CC 2020 Edition)
echo   Dang khoi dong ung dung o che do App Window...
echo ========================================================

:: 1. Kiem tra xem port 8088 da chay chua, neu chua thi khoi dong server ngam
netstat -ano | findstr ":8088" >nul
if %errorlevel% neq 0 (
    start /min python -m http.server 8088
    timeout /t 1 /nobreak >nul
)

:: 2. Mo ung dung duoi dang cua so Desktop Doc Lap (--app mode khong co thanh URL)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8088 --window-size=1600,1000
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:8088 --window-size=1600,1000
) else (
    start http://localhost:8088
)

echo Khoi dong hoan tat!
