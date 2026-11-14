set -e

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${XDG_DATA_HOME:-$HOME/.local/share}/enhanced-soundcloud-rpc"
NODE="$(command -v node || true)"

if [ -z "$NODE" ]; then
    echo "Node.js not found. Install it from https://nodejs.org (LTS), then run this again."
    exit 1
fi

mkdir -p "$DEST"
cp "$SRC/bridge.js" "$SRC/package.json" "$DEST/"
cd "$DEST"
npm install --omit=dev --no-audit --no-fund

case "$(uname -s)" in
    Linux)
        UNIT_DIR="$HOME/.config/systemd/user"
        mkdir -p "$UNIT_DIR"
        cat > "$UNIT_DIR/enhanced-soundcloud-rpc.service" <<UNIT
[Unit]
Description=Enhanced SoundCloud Discord bridge

[Service]
ExecStart="$NODE" "$DEST/bridge.js"
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
UNIT
        systemctl --user daemon-reload
        systemctl --user enable enhanced-soundcloud-rpc
        systemctl --user restart enhanced-soundcloud-rpc
        ;;
    Darwin)
        AGENTS="$HOME/Library/LaunchAgents"
        PLIST="$AGENTS/com.enhancedsoundcloud.rpc.plist"
        mkdir -p "$AGENTS"
        cat > "$PLIST" <<PLISTDATA
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>com.enhancedsoundcloud.rpc</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE</string>
        <string>$DEST/bridge.js</string>
    </array>
    <key>WorkingDirectory</key><string>$DEST</string>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><true/>
</dict>
</plist>
PLISTDATA
        launchctl unload "$PLIST" 2>/dev/null || true
        launchctl load "$PLIST"
        ;;
    *)
        echo "Unsupported system. Run manually: node $DEST/bridge.js"
        exit 1
        ;;
esac

echo
echo "Done. Bridge is running and will start at every login."
