#!/bin/bash

echo "============================================================"
echo " 🗑️ UNINSTALLING WEDDING SONG IMPORTER"
echo "============================================================"
echo ""

CEP_TARGET="$HOME/Library/Application Support/Adobe/CEP/extensions/com.wedding.songimporter"
APP_TARGET="$HOME/Library/Application Support/WeddingSongImporter"
PLIST_TARGET="$HOME/Library/LaunchAgents/com.trpworld.weddingimporter.plist"

# 1. Unload LaunchAgent & kill processes on port 5050
echo "🛑 Stopping background agent service..."
launchctl unload "$PLIST_TARGET" 2>/dev/null || true
lsof -ti:5050 | xargs kill -9 2>/dev/null || true

# 2. Remove files
echo "🗑️ Removing installed files..."
rm -f "$PLIST_TARGET"
rm -rf "$CEP_TARGET"
rm -rf "$APP_TARGET"

echo ""
echo "============================================================"
echo " ✅ UNINSTALLATION COMPLETE!"
echo "============================================================"

osascript -e 'display notification "Wedding Song Importer uninstalled completely." with title "Uninstall Complete"' 2>/dev/null || true
