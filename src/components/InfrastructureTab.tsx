import { Server, Cpu, Database, Network, ShieldCheck, HardDrive, Terminal, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

export function InfrastructureTab() {
  const specs = [
    {
      title: 'Sistem Operasi (OS) & Systemd Service',
      icon: <Server className="w-5 h-5 text-[#38bdf8]" />,
      details: [
        { label: 'Sistem Operasi', value: 'Linux Ubuntu 24.04 LTS (Noble Numbat - 2026 Edition)' },
        { label: 'Service Daemon', value: 'systemd (fadhilbot.service)' },
        { label: 'Auto-Restart Policy', value: 'Restart=always (Interval 3 detik, boot otomatis)' },
        { label: 'Kernel Security', value: 'Linux 6.8+ HWE Kernel, cgroups v2 resource accounting' }
      ]
    },
    {
      title: 'Daya Komputasi & Alokasi CPU Dedicated',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      details: [
        { label: 'Kapasitas CPU', value: '1 Dedicated vCPU (Bukan 200% / Multi-Core shared)' },
        { label: 'Target Governor', value: '75% - 85% Utilisasi Aman (Ceiling Maksimal 100%)' },
        { label: 'Alokasi Video MP4', value: '56% - 62% Komputasi (Prioritas Share-Screen Mutlak)' },
        { label: 'Alokasi Audio On-Mic', value: '16% - 19% (Stereo Opus 192k + DynAudNorm Leveler)' },
        { label: 'FFmpeg Threads', value: '2 Threads Terisolasi (Mencegah thread starvation)' }
      ]
    },
    {
      title: 'Manajemen Memori 1GB RAM & Swap',
      icon: <HardDrive className="w-5 h-5 text-amber-400" />,
      details: [
        { label: 'Alokasi RAM Fisik', value: '1 GB (1024 MB) RAM Terdedikasi' },
        { label: 'SWAP Space', value: '2 GB NVMe Swap (/swapfile swappiness=20)' },
        { label: 'Node.js Heap Cap', value: '--max-old-space-size=512 (512 MB V8 Ceiling)' },
        { label: 'Memory Watchdog', value: 'Otomatis membersihkan buffer saat heap > 400MB' },
        { label: 'Penyimpanan (Disk)', value: '20 GB NVMe Storage (Assets + Cache < 2GB)' }
      ]
    },
    {
      title: 'Streaming Engine & Protokol Jaringan',
      icon: <Network className="w-5 h-5 text-[#a855f7]" />,
      details: [
        { label: 'Go-Live Video Target', value: '480p - 720p @ 30 - 35 FPS (Konsisten & Anti-Stutter)' },
        { label: 'Audio Microphone', value: 'Always ON-MIC, Loudness Locked (+3.2dB, Zero-Drop)' },
        { label: 'Enkripsi Protokol', value: 'Discord DAVE Protocol v1 E2EE (WebRTC SAVPF)' },
        { label: 'Keep-Alive HTTP', value: 'Express Server di Port 3000 (Health Endpoint: /health)' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#38bdf8]" />
              <span>Arsitektur &amp; Kontrol Engine VPS Ubuntu 24.04 LTS (1 Dedicated vCPU / 1GB RAM)</span>
            </h2>
            <p className="text-sm text-[#94a3b8] mt-1">
              Engine telah disesuaikan secara mendalam untuk lingkungan VPS 1 Dedicated vCPU, 1 GB RAM, dan 20 GB Disk di sistem Linux Ubuntu 24.04 LTS per 2026-10-10.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 1 vCPU Dedicated 100% Controlled
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specs.map((item, idx) => (
          <div key={idx} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 hover:border-[#334155] transition-colors">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              {item.icon}
              {item.title}
            </h3>
            <div className="space-y-2.5 text-xs">
              {item.details.map((d, dIdx) => (
                <div key={dIdx} className="flex items-start justify-between gap-3 border-b border-[#1e293b] pb-2 last:border-0 last:pb-0">
                  <span className="text-[#94a3b8] font-mono shrink-0">{d.label}</span>
                  <span className="text-right text-[#cbd5e1] font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Diagram Ketahanan 24/7 Selamanya (Auto-Restart Saat Reboot / Crash)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#080d1a] border border-[#1e293b] rounded-lg">
            <div className="text-[#38bdf8] font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              1. Systemd Service (Ubuntu 24.04)
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              Unit <code className="text-sky-300">fadhilbot.service</code> dikonfigurasi dengan <code className="text-sky-300">Restart=always</code> dan timeout 3 detik. Begitu server reboot atau mati lampu, daemon langsung otomatis menyala saat Linux booting tanpa perlu campur tangan manual.
            </p>
          </div>

          <div className="p-4 bg-[#080d1a] border border-[#1e293b] rounded-lg">
            <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              2. Governor 1 vCPU &amp; 1GB RAM Shield
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              Komputasi diatur ketat di 75-85% untuk MP4 Share-Screen (480p-720p 30-35fps). V8 Old Space dibatasi di 512MB dipadu 2GB swap, sehingga proses kebal terhadap Linux OOM Killer.
            </p>
          </div>

          <div className="p-4 bg-[#080d1a] border border-[#1e293b] rounded-lg">
            <div className="text-[#a855f7] font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              3. Voice Reconnect &amp; On-Mic Sync
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              Detak jantung watchdog menjaga status ON-MIC hijau aktif selamanya. Jika koneksi voice terputus, bot otomatis rejoin dalam 3-5 detik dan melanjutkan playlist loop secara instan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
