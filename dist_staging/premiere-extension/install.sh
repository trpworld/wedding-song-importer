#!/bin/bash

echo "========================================================"
echo " 🎬 Installing Wedding Song Importer Extension for Premiere Pro"
echo "========================================================"

# Target CEP Directory on macOS
CEP_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions"
EXTENSION_NAME="com.wedding.songimporter"
TARGET_PATH="$CEP_DIR/$EXTENSION_NAME"
SOURCE_PATH="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$CEP_DIR"

# Remove existing symlink or folder if present
if [ -L "$TARGET_PATH" ] || [ -d "$TARGET_PATH" ]; then
    echo "🗑️ Removing previous installation link..."
    rm -rf "$TARGET_PATH"
fi

echo "🔗 Symlinking extension to Adobe CEP Extensions directory:"
echo "   Source: $SOURCE_PATH"
echo "   Target: $TARGET_PATH"
ln -s "$SOURCE_PATH" "$TARGET_PATH"

echo "🔓 Enabling PlayerDebugMode in CSXS defaults..."
defaults write com.adobe.CSXS.9 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.10 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.11 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.12 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.13 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.14 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.15 PlayerDebugMode 1 2>/dev/null
defaults write com.adobe.CSXS.16 PlayerDebugMode 1 2>/dev/null

echo ""
echo "✅ Installation Complete!"
echo "   1. Open Adobe Premiere Pro"
echo "   2. Go to: Window > Extensions > Wedding Song Importer"
echo "========================================================"
