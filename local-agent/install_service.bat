@echo off
title Install Windows Background Startup Service for Local Agent
echo ==========================================================
echo  ⚙️ Installing Windows Background Startup Service
echo ==========================================================

set SCRIPT_DIR=%~dp0
set VBS_PATH=%SCRIPT_DIR%run_hidden.vbs
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_PATH=%STARTUP_FOLDER%\WeddingLocalAgent.vbs

echo 📄 Copying silent startup launcher to Windows Startup folder...
copy /Y "%VBS_PATH%" "%SHORTCUT_PATH%"

echo.
echo ✅ Background Service installed successfully!
echo    Status: Agent will run silently in background on Windows login.
echo.
pause
