# Discord 24/7 MP4 Screen-Share & On-Mic Audio Engine (2026 Edition)

> Engine & Template Hosting Discord 24 Jam Nonstop untuk **Linux Ubuntu 24.04 LTS (1 Dedicated vCPU, 1 GB RAM, 20 GB Disk)**.
> Dilengkapi **Go-Live Share-Screen MP4 Prioritas 480p–720p @ 30–35 FPS Konsisten & Mulus**, **Audio On-Mic Keras (+3.2dB DynAudNorm) & Jernih Zero-Drop**, **Kontrol Penuh 1 Dedicated vCPU Governor (Target 75-85% / Max 100%)**, **Memory Shield 1GB RAM (V8 Cap 512MB & 2GB Swap)**, **Custom Presence Image Cropper Web & ZIP Bundling**, **Systemd Auto-Restart Selamanya (Kebal Server Reboot)**, dan **Rotasi Playlist Bergilir (Gradation ↔ AIZO)**.

---

## 🌟 Fitur Unggulan Arsitektur 2026 (Ubuntu 24.04 LTS):

1. **Fokus Utama: MP4 Share-Screen Prioritas Mutlak (480p - 720p @ 30 - 35 FPS)**:
   - Berbeda dari versi lama yang mendiskriminasi video, engine kali ini **memprioritaskan streaming MP4 share-screen**:
     * Resolusi konsisten di rentang minimal 480p (`854x480`) hingga maksimal 720p (`1280x720`).
     * Framerate stabil dan konsisten pada **30 - 35 FPS** (rock-solid zero stutter & zero lag).
     * x264 software-pacing menggunakan 2 thread terisolasi (`preset: superfast/veryfast`, `tune: zerolatency`, `bf: 0, refs: 1`).
     * Alokasi komputasi video: **~56% - 62% daya CPU**.

2. **Audio On-Mic MP3 Tetap Jernih, Keras, dan Zero Volume Drop**:
   - Audio microphone on-mic tetap berstatus prioritas tinggi tanpa penurunan kualitas atau penyusutan volume:
     * **DynAudNorm Real-time Loudness Normalizer**: `dynaudnorm=f=75:g=15:m=8.0:r=0.96:b=1:c=1:s=6` mengunci gain agar volume **TIDAK PERNAH MENYUSUT ATAU MENURUN**.
     * **Parametric Studio EQ & Audio Boost**: `volume=1.45` (+3.2dB boost) dengan filter frekuensi 80Hz dan 2800Hz.
     * **TruePeak Brickwall Limiter**: Lookahead limiter `alimiter=0.97` (-0.27 dBFS) mencegah clipping dan mencegah AGC ducking Discord.
     * **Opus 48kHz Stereo CBR 192 kbps**: Kloning buffer terpisah untuk Mic dan Go-Live tile (Zero Audio Corruption).
     * Alokasi komputasi audio: **~16% - 19% daya CPU**.

3. **Kontrol Penuh & Adaptif 1 Dedicated vCPU (Bukan Lagi 200% Multi-Core)**:
   - Dikalibrasi spesifik untuk server VPS 1 Dedicated vCPU:
     * **Kapasitas Maksimal**: 100% (1 dedicated CPU core).
     * **Target Utilisasi Aman**: **75% - 85%** (menyisakan 15-20% headroom untuk Linux kernel & Node.js event loop agar bebas frame drop).
     * **Total Komputasi**: Video MP4 (~58%) + Audio DSP (~18%) + DAVE WebRTC Crypto (~6%) = ~82% utilisasi optimal.

4. **Perlindungan Memori 1 GB RAM & Mencegah Linux OOM Killer**:
   - V8 JavaScript Engine dibatasi dengan `--max-old-space-size=512` (512 MB).
   - Skrip setup mengonfigurasi otomatis **2 GB NVMe SWAP** (`/swapfile` dengan swappiness 20) sehingga server 1GB RAM tidak pernah mengalami crash out-of-memory.
   - Internal Memory Watchdog memeriksa heap setiap 30 detik dan membersihkan buffer secara agresif jika memori mendekati batas.

5. **Kustomisasi Ekspresif Rich Presence & Pemotong Gambar Internal Web**:
   - Web dashboard menyediakan **fitur upload & interactive image cropper/cutter internal**:
     * Pengguna bisa memilih dan memotong gambar secara bebas (zoom, geser horizontal/vertikal, preview kotak 1:1 atau bulat avatar).
     * Gambar yang dipotong langsung disimpan sebagai aset internal dan **otomatis dikemas ke dalam ZIP** sebagai `assets/custom_presence.png`.
     * Mendukung status ekspresif: STREAMING (badge ungu LIVE), PLAYING, LISTENING, WATCHING, COMPETING, dan durasi elapsed waktu siaran.

6. **Bot Menyala Selamanya (Auto-Restart Systemd per 2026-10-10)**:
   - Disediakan service unit resmi `/etc/systemd/system/fadhilbot.service` dengan konfigurasi `Restart=always` dan `RestartSec=3s`.
   - **Bahkan jika server VPS reboot, mati listrik, atau mengalami crash**, sistem operasi Ubuntu 24.04 secara otomatis menyalakan bot kembali begitu sistem selesai boot!
   - Dilengkapi file installer otomatis: `setup-ubuntu-24-04.sh`.

7. **Rotasi Playlist Bergilir & Sinkronisasi Tanpa Batas**:
   - Track 1: `assets/infinite720p.mp4` & `assets/infinite.mp3` (Infinite 720p @ 30-35 FPS).
   - Track 2: `assets/aizo480p.mp4` & `assets/aizo.mp3` (AIZO 480p Fluid @ 35 FPS).
   - Replay berulang tanpa henti dengan jeda anti-deteksi alami 1-2 menit setiap 2 jam siaran.

---

## 🚀 Panduan Instalasi Cepat di VPS Ubuntu 24.04 LTS:

1. Siapkan VPS Ubuntu 24.04 Anda (1 Dedicated vCPU, 1GB RAM, 20GB Disk).
2. Unduh file ZIP dari web dashboard atau clone repositori ini ke VPS:
   ```bash
   git clone https://github.com/futurisme/mybot2.git /opt/fadhilbot
   cd /opt/fadhilbot
   ```
3. Pastikan file aset media ada di `/opt/fadhilbot/assets/`:
   - `assets/infinite720p.mp4`
   - `assets/infinite.mp3`
   - `assets/aizo480p.mp4`
   - `assets/aizo.mp3`
   - `assets/custom_presence.png` (jika menggunakan custom presence dari web)
4. Jalankan skrip instalasi otomatis:
   ```bash
   sudo bash setup-ubuntu-24-04.sh
   ```
5. Masukkan token akun Anda di `/opt/fadhilbot/.env`:
   ```bash
   nano /opt/fadhilbot/.env
   # Ganti DISCORD_TOKEN dengan token Anda
   ```
6. Restart service untuk menerapkan token:
   ```bash
   sudo systemctl restart fadhilbot
   ```
7. Cek status bot:
   ```bash
   sudo systemctl status fadhilbot
   journalctl -u fadhilbot -f
   ```
   Bot Anda kini resmi berjalan 24/7 selamanya dengan prioritas MP4 share-screen dan audio jernih!
