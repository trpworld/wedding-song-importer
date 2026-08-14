@echo off
title Install Wedding Song Importer for Premiere Pro
echo ========================================================
echo  🎬 Installing Wedding Song Importer Extension for Premiere Pro
echo ========================================================

set TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\com.wedding.songimporter
set SOURCE_DIR=%~dp0

if not exist "%APPDATA%\Adobe\CEP\extensions" (
    mkdir "%APPDATA%\Adobe\CEP\extensions"
)

if exist "%TARGET_DIR%" (
    echo 🗑️ Removing existing installation...
    rmdir /S /Q "%TARGET_DIR%"
)

echo 🔗 Linking extension to Adobe CEP extensions folder...
mklink /D "%TARGET_DIR%" "%SOURCE_DIR:~0,-1%"

echo 🔓 Enabling PlayerDebugMode in Windows Registry...
REG ADD "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.13" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.14" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.15" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
REG ADD "HKCU\Software\Adobe\CSXS.16" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1

echo.
echo ✅ Installation Complete!
echo    1. Open Adobe Premiere Pro
echo    2. Go to: Window ^> Extensions ^> Wedding Song Importer
pause
