#!/bin/bash

echo "=========================================================="
echo " ⚙️ Installing macOS LaunchAgent Daemon for Local Agent"
echo "=========================================================="

PLIST_NAME="com.wedding.localagent.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENTS_DIR/$PLIST_NAME"
AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Locate python binary
PYTHON_BIN="$AGENT_DIR/venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    PYTHON_BIN="$(which python3)"
fi

AGENT_SCRIPT="$AGENT_DIR/agent.py"
LOG_FILE="$AGENT_DIR/agent.log"

mkdir -p "$LAUNCH_AGENTS_DIR"

echo "📄 Generating launchd configuration at $PLIST_PATH..."

cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wedding.localagent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PYTHON_BIN</string>
        <string>$AGENT_SCRIPT</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$AGENT_DIR</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOG_FILE</string>
    <key>StandardErrorPath</key>
    <string>$LOG_FILE</string>
</dict>
</plist>
EOF

echo "🔄 Registering service with launchctl..."
launchctl unload "$PLIST_PATH" 2>/dev/null
launchctl load -w "$PLIST_PATH"

echo ""
echo "✅ LaunchAgent Daemon installed successfully!"
echo "   Status: Agent will run silently in background on system startup."
echo "   Log File: $LOG_FILE"
echo "=========================================================="
