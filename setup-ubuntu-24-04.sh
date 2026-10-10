#!/bin/bash
# ==============================================================================
# FadhilBot 2026 Production Installer for Ubuntu 24.04 LTS (Noble Numbat)
# Optimized for: 1 Dedicated vCPU, 1 GB RAM, 20 GB Disk
# Target: Permanent 24/7 Uptime (Auto-Restart on Reboot/Crash via Systemd)
# Date: 2026-10-10
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}    FADHILBOT DISCORD 24/7 MP4 SCREEN-SHARE & AUDIO ENGINE       ${NC}"
echo -e "${CYAN}    Linux Ubuntu 24.04 LTS Dedicated 1 vCPU / 1GB RAM Setup     ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Pastikan dijalankan sebagai root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Skrip ini harus dijalankan sebagai root (gunakan sudo bash setup-ubuntu-24-04.sh)${NC}"
  exit 1
fi

APP_DIR="/opt/fadhilbot"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}[1/7] Mengonfigurasi SWAP 2GB untuk VPS 1GB RAM (Mencegah Linux OOM Killer)...${NC}"
# VPS 1GB RAM membutuhkan swap minimal 2GB agar FFmpeg encoding dan Node.js tidak terkena OOM
if [ ! -f /swapfile ]; then
  echo -e "${YELLOW}  -> Membuat /swapfile 2GB...${NC}"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  # Atur swappiness optimal untuk 1GB RAM
  sysctl vm.swappiness=20
  echo 'vm.swappiness=20' > /etc/sysctl.d/99-fadhilbot-swap.conf
  echo -e "${GREEN}  -> Swap 2GB berhasil diaktifkan.${NC}"
else
  echo -e "${GREEN}  -> Swapfile sudah ada, dilewati.${NC}"
fi

echo -e "${BLUE}[2/7] Memperbarui repositori paket Ubuntu 24.04 & menginstal dependensi dasar...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  curl \
  wget \
  git \
  build-essential \
  ffmpeg \
  ca-certificates \
  libasound2 \
  libopus0

echo -e "${BLUE}[3/7] Memeriksa & Menginstal Node.js 22 LTS...${NC}"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
  echo -e "${YELLOW}  -> Menginstal Node.js 22 LTS via NodeSource...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}  -> Node.js terdeteksi: $(node -v) | npm: $(npm -v)${NC}"
echo -e "${GREEN}  -> FFmpeg terdeteksi: $(ffmpeg -version | head -n 1)${NC}"

echo -e "${BLUE}[4/7] Menyalin kode aplikasi ke ${APP_DIR}...${NC}"
mkdir -p "${APP_DIR}"
mkdir -p "${APP_DIR}/assets"

if [ "${SOURCE_DIR}" != "${APP_DIR}" ]; then
  echo -e "${YELLOW}  -> Menyalin file proyek ke ${APP_DIR}...${NC}"
  rsync -av --exclude 'node_modules' --exclude '.git' "${SOURCE_DIR}/" "${APP_DIR}/" || cp -rf "${SOURCE_DIR}"/* "${APP_DIR}/"
fi

cd "${APP_DIR}"

echo -e "${BLUE}[5/7] Memeriksa file .env dan aset media...${NC}"
if [ ! -f "${APP_DIR}/.env" ]; then
  if [ -f "${APP_DIR}/.env.example" ]; then
    cp "${APP_DIR}/.env.example" "${APP_DIR}/.env"
    echo -e "${YELLOW}  -> .env dibuat dari template .env.example. Harap isi DISCORD_TOKEN di ${APP_DIR}/.env!${NC}"
  else
    cat << 'EOF' > "${APP_DIR}/.env"
DISCORD_TOKEN=MASUKKAN_TOKEN_DISCORD_ANDA_DISINI
PORT=3000
VOICE_CHANNEL_ID=1366441630151737445
VOICE_GUILD_ID=1323944038117675038
FFMPEG_THREADS=2
AUDIO_BITRATE=192
AUDIO_BOOST=1.45
EOF
    echo -e "${YELLOW}  -> File .env dibuat secara otomatis.${NC}"
  fi
fi

# Cek apakah folder assets berisi file video/audio
echo -e "${CYAN}  -> Memeriksa file media di ${APP_DIR}/assets:...${NC}"
for f in infinite720p.mp4 aizo480p.mp4 infinite.mp3 aizo.mp3; do
  if [ -f "${APP_DIR}/assets/${f}" ]; then
    echo -e "${GREEN}     [OK] assets/${f} ($(du -h "${APP_DIR}/assets/${f}" | cut -f1))${NC}"
  else
    echo -e "${YELLOW}     [WARN] assets/${f} belum ada. Pastikan ditaruh di ${APP_DIR}/assets/${NC}"
  fi
done

echo -e "${BLUE}[6/7] Menginstal dependensi Node.js...${NC}"
npm install --omit=dev --no-audit --no-fund

echo -e "${BLUE}[7/7] Mendaftarkan Systemd Service (Otomatis Nyala Selamanya & Saat Reboot)...${NC}"
SERVICE_FILE="/etc/systemd/system/fadhilbot.service"

cp -f "${APP_DIR}/fadhilbot.service" "${SERVICE_FILE}" || cat << 'EOF' > "${SERVICE_FILE}"
[Unit]
Description=FadhilBot 24/7 Discord MP4 480p-720p Screen-Share Engine
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/fadhilbot
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NODE_OPTIONS="--max-old-space-size=512"
EnvironmentFile=-/opt/fadhilbot/.env
ExecStart=/usr/bin/node --max-old-space-size=512 /opt/fadhilbot/index.js
Restart=always
RestartSec=3s
StartLimitIntervalSec=120
StartLimitBurst=10
CPUWeight=100
MemoryHigh=750M
MemoryMax=850M
KillMode=process

[Install]
WantedBy=multi-user.target
EOF

chmod 644 "${SERVICE_FILE}"
systemctl daemon-reload
systemctl enable fadhilbot.service
systemctl restart fadhilbot.service

echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}    INSTALASI SELESAI DENGAN SUKSES!                            ${NC}"
echo -e "${GREEN}    Bot dikonfigurasi untuk berjalan 24/7 SELAMANYA.            ${NC}"
echo -e "${GREEN}    Bahkan jika server reboot / mati listrik, bot otomatis nyala!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo -e "Perintah Berguna:"
echo -e "  - Cek Status:  ${CYAN}systemctl status fadhilbot${NC}"
echo -e "  - Lihat Log:   ${CYAN}journalctl -u fadhilbot -f -n 100${NC}"
echo -e "  - Restart:     ${CYAN}systemctl restart fadhilbot${NC}"
echo -e "  - Stop:        ${CYAN}systemctl stop fadhilbot${NC}"
echo -e "  - Cek Web API: ${CYAN}curl http://localhost:3000/${NC}"
echo -e "================================================================"
