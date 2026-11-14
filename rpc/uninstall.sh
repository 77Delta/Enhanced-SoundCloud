DEST="${XDG_DATA_HOME:-$HOME/.local/share}/enhanced-soundcloud-rpc"

case "$(uname -s)" in
    Linux)
        systemctl --user disable --now enhanced-soundcloud-rpc 2>/dev/null || true
        rm -f "$HOME/.config/systemd/user/enhanced-soundcloud-rpc.service"
        systemctl --user daemon-reload
        ;;
    Darwin)
        PLIST="$HOME/Library/LaunchAgents/com.enhancedsoundcloud.rpc.plist"
        launchctl unload "$PLIST" 2>/dev/null || true
        rm -f "$PLIST"
        ;;
esac

rm -rf "$DEST"
echo "Bridge removed."
