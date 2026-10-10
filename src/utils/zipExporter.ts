import JSZip from 'jszip';
import { RepoFile } from '../types';

/**
 * Ekspor file repositori sebagai file ZIP siap pakai untuk Ubuntu 24.04 LTS & 1 vCPU VPS.
 * Mengikutsertakan file kode, systemd service, skrip installer otomatis,
 * dan gambar Rich Presence kustom yang di-crop/select dari web.
 */
export async function exportFilesAsZip(
  files: RepoFile[],
  zipFilename = 'fadhilbot-ubuntu24-mp4-priority.zip',
  customPresenceImage?: string
): Promise<void> {
  const zip = new JSZip();

  // Masukkan file kode, skrip, dan konfigurasi (KECUALIKAN video/audio berat)
  files.forEach(file => {
    const isHeavyMedia = file.name.endsWith('.mp4') || file.name.endsWith('.mp3');

    if (!isHeavyMedia) {
      zip.file(file.path, file.content);
    }
  });

  // Jika user mengunggah & memotong gambar custom presence dari web, masukkan langsung ke zip!
  if (customPresenceImage && customPresenceImage.startsWith('data:image/')) {
    try {
      const base64Data = customPresenceImage.split(',')[1];
      if (base64Data) {
        zip.file('assets/custom_presence.png', base64Data, { base64: true });
      }
    } catch (imgErr) {
      console.warn('Gagal menambahkan custom presence image ke ZIP:', imgErr);
    }
  }

  // Sertakan panduan cepat penempatan aset & deploy Ubuntu 24.04
  zip.file('assets/PETUNJUK_ASET.txt', 
`[STRUKTUR ASSET MEDIA DISCORD 24/7 - UBUNTU 24.04 LTS]
Untuk menghemat kuota & waktu unduh, file video & audio besar tidak disertakan di zip ini.

Pastikan file media berikut berada di dalam folder 'assets/' pada VPS Anda:
1. assets/infinite720p.mp4 (Video Track 1 - Infinite 720p 30-35 FPS)
2. assets/infinite.mp3     (Audio Asli Jernih & Boosted Track 1)
3. assets/aizo480p.mp4     (Video Track 2 - AIZO 720p/480p 30-35 FPS)
4. assets/aizo.mp3         (Audio Asli Jernih & Boosted Track 2)
${customPresenceImage ? '5. assets/custom_presence.png (Gambar Rich Presence Kustom yang sudah Anda potong dari Web)' : ''}

Cara Pasang Otomatis di Ubuntu 24.04 LTS (1 Dedicated vCPU / 1GB RAM):
1. Ekstrak zip ini ke VPS (contoh: /opt/fadhilbot)
2. Jalankan: sudo bash setup-ubuntu-24-04.sh
3. Bot otomatis berjalan 24/7 selamanya & auto-restart jika server reboot!`
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  
  const downloadUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

