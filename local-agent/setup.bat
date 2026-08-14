@echo off
title Wedding Song Local Downloader Agent Setup
echo ======================================================
echo  🎧 Setting up Wedding Song Local Downloader Agent
echo ======================================================

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH! Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo 📦 Installing required dependencies...
python -m pip install --upgrade flask flask-cors yt-dlp

where ffmpeg >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ WARNING: ffmpeg not detected in PATH.
    echo    Please download ffmpeg from https://ffmpeg.org and add it to your System PATH
    echo    for MP3 conversion to work properly.
) else (
    echo ✅ ffmpeg detected successfully!
)

echo.
echo 🚀 Starting Local Downloader Agent on http://localhost:5050 ...
python agent.py
pause
