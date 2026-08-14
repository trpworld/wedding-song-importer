#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "============================================================"
echo " 🚀 INSTALLING WEDDING SONG IMPORTER FOR ADOBE PREMIERE PRO"
echo "============================================================"
echo ""

# 1. Target Directories
CEP_TARGET="$HOME/Library/Application Support/Adobe/CEP/extensions/com.wedding.songimporter"
APP_TARGET="$HOME/Library/Application Support/WeddingSongImporter/bin"
PLIST_TARGET="$HOME/Library/LaunchAgents/com.trpworld.weddingimporter.plist"

mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"
mkdir -p "$APP_TARGET"
mkdir -p "$HOME/Library/LaunchAgents"

# 2. Install CEP Extension
echo "📁 Installing CEP Extension to Adobe directory..."
rm -rf "$CEP_TARGET"
cp -R "$DIR/premiere-extension" "$CEP_TARGET"

# 3. Enable Adobe PlayerDebugMode across CSXS 9 to 16
echo "⚙️ Enabling Adobe PlayerDebugMode developer flags..."
for v in 9 10 11 12 13 14 15 16; do
  defaults write com.adobe.CSXS.$v PlayerDebugMode 1 2>/dev/null || true
done

# 4. Install Standalone Agent Binary
echo "🐍 Installing Local Agent Background Service..."
lsof -ti:5050 | xargs kill -9 2>/dev/null || true
cp "$DIR/bin/wedding-agent-darwin" "$APP_TARGET/wedding-agent-darwin"
chmod +x "$APP_TARGET/wedding-agent-darwin"

# 5. Configure LaunchAgent plist for 24/7 background execution at login
cat << 'EOF' > "$PLIST_TARGET"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.trpworld.weddingimporter</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/USER_NAME_PLACEHOLDER/Library/Application Support/WeddingSongImporter/bin/wedding-agent-darwin</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/USER_NAME_PLACEHOLDER/Library/Application Support/WeddingSongImporter/agent.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/USER_NAME_PLACEHOLDER/Library/Application Support/WeddingSongImporter/agent_error.log</string>
</dict>
</plist>
EOF

sed -i '' "s|/Users/USER_NAME_PLACEHOLDER|$HOME|g" "$PLIST_TARGET"

# Load LaunchAgent service
launchctl unload "$PLIST_TARGET" 2>/dev/null || true
launchctl load -w "$PLIST_TARGET" 2>/dev/null || true

# Launch binary background daemon
"$APP_TARGET/wedding-agent-darwin" >/dev/null 2>&1 &

echo ""
echo "============================================================"
echo " 🎉 INSTALLATION COMPLETE!"
echo " Open Adobe Premiere Pro -> Window > Extensions > Wedding Song Importer"
echo "============================================================"

# Trigger macOS GUI notification
osascript -e 'display notification "Wedding Song Importer installed and active on port 5050!" with title "Wedding Song Importer" sound name "Glass"' 2>/dev/null || true
