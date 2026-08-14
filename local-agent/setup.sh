#!/bin/bash

echo "======================================================"
echo " 🎧 Setting up Wedding Song Local Downloader Agent"
echo "======================================================"

# Check Python3
if ! command -v python3 &> /dev/null
then
    echo "❌ Python3 is not installed. Please install Python 3.8+."
    exit 1
fi

echo "📦 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "📦 Installing required Python dependencies (flask, flask-cors, yt-dlp)..."
pip install --upgrade flask flask-cors yt-dlp

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null
then
    echo "⚠️ WARNING: 'ffmpeg' is not found in PATH."
    echo "   yt-dlp requires ffmpeg to convert audio to high quality MP3."
    echo "   On macOS install via Homebrew: brew install ffmpeg"
    echo "   On Ubuntu/Debian: sudo apt install ffmpeg"
else
    echo "✅ ffmpeg detected successfully!"
fi

echo ""
echo "🚀 Starting Local Downloader Agent on http://localhost:5050 ..."
python agent.py

