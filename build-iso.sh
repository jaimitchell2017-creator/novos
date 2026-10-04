#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ISO_WORK="$ROOT_DIR/iso/.work"
DIST_DIR="$ROOT_DIR/dist"
OUT="$ROOT_DIR/NOVOS-OS-Development-0.1-amd64.iso"

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "dist/index.html is missing. Run npm run web:build first."
  exit 1
fi

rm -rf "$ISO_WORK"
mkdir -p "$ISO_WORK/config/includes.chroot/opt/novos" \
  "$ISO_WORK/config/includes.chroot/etc/systemd/system" \
  "$ISO_WORK/config/includes.chroot/etc/novos"
cp -a "$DIST_DIR/." "$ISO_WORK/config/includes.chroot/opt/novos/"

cat > "$ISO_WORK/config/package-lists/novos.list.chroot" <<'PKGS'
linux-image-amd64
systemd-sysv
xorg
xinit
xserver-xorg-video-all
openbox
chromium
network-manager
dbus-x11
sudo
curl
ca-certificates
fonts-dejavu
fonts-liberation
firmware-linux
firmware-linux-free
firmware-linux-nonfree
firmware-misc-nonfree
firmware-iwlwifi
firmware-realtek
firmware-mediatek
firmware-atheros
firmware-brcm80211
firmware-amd-graphics
firmware-intel-graphics
firmware-sof-signed
PKGS

cat > "$ISO_WORK/config/includes.chroot/etc/novos/start-novos.sh" <<'SCRIPT'
#!/bin/sh
set -eu
export DISPLAY=:0
export XDG_RUNTIME_DIR=/run/user/1000
mkdir -p /run/user/1000
chown novos:novos /run/user/1000 || true
exec chromium --no-first-run --disable-session-crashed-bubble --disable-infobars --kiosk --start-maximized file:///opt/novos/index.html
SCRIPT
chmod +x "$ISO_WORK/config/includes.chroot/etc/novos/start-novos.sh"

cat > "$ISO_WORK/config/includes.chroot/etc/systemd/system/novos.service" <<'UNIT'
[Unit]
Description=NOVOS desktop shell
After=network-online.target graphical.target
Wants=network-online.target

[Service]
Type=simple
User=novos
Environment=DISPLAY=:0
ExecStart=/usr/bin/startx /usr/bin/chromium -- --no-first-run --disable-session-crashed-bubble --disable-infobars --kiosk --start-maximized file:///opt/novos/index.html
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target
UNIT

mkdir -p "$ISO_WORK/config/hooks/live"
cat > "$ISO_WORK/config/hooks/live/9999-novos.hook.chroot" <<'HOOK'
#!/bin/sh
set -e
id novos >/dev/null 2>&1 || useradd -m -s /bin/bash novos
usermod -aG audio,video,render,input novos || true
systemctl enable NetworkManager || true
systemctl enable novos.service || true
# Prefer the NOVOS shell over a traditional desktop session.
cat > /etc/systemd/system/getty@tty1.service.d/override.conf <<'DROPIN'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin novos --noclear %I $TERM
DROPIN
HOOK
chmod +x "$ISO_WORK/config/hooks/live/9999-novos.hook.chroot"

cat > "$ISO_WORK/auto/config" <<'EOF2'
#!/bin/sh
set -e
lb config \
  --distribution bookworm \
  --architectures amd64 \
  --archive-areas "main contrib non-free non-free-firmware" \
  --binary-images iso-hybrid \
  --debian-installer none \
  --apt-indices false \
  --memtest none \
  --iso-application "NOVOS OS Development" \
  --iso-volume "NOVOS-OS-DEV"
EOF2
chmod +x "$ISO_WORK/auto/config"

cd "$ISO_WORK"
./auto/config
sudo lb build
cp -f live-image-amd64.hybrid.iso "$OUT"
echo "Created $OUT"
