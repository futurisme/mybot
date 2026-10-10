import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Sparkles,
  Tv,
  Gamepad2,
  Headphones,
  Eye,
  Trophy,
  Check,
  Copy,
  ExternalLink,
  Sliders,
  RefreshCw,
  Upload,
  Crop,
  Image as ImageIcon,
  Activity,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Download,
  Flame,
  Music,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { VoiceConfig, RichPresenceCustomConfig } from '../types';

interface RichPresenceTabProps {
  voiceConfig: VoiceConfig;
  onUpdateVoiceConfig: (config: VoiceConfig) => void;
  onNavigateToEditor?: () => void;
}

export function RichPresenceTab({
  voiceConfig,
  onUpdateVoiceConfig,
  onNavigateToEditor
}: RichPresenceTabProps) {
  const currentRpc: RichPresenceCustomConfig = voiceConfig.richPresence || {
    name: 'YouTube Live Screen-Share',
    type: 'STREAMING',
    url: voiceConfig.liveStream?.youtubeUrl || 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ',
    details: 'Infinite (720p Screen-Share)',
    state: 'Menyiarkan MP4 480p-720p @ 30-35 FPS (Go-Live)',
    largeImage: 'assets/custom_presence.png',
    largeText: '720p 35FPS Go-Live Screen-Share (1 Dedicated vCPU)',
    smallImage: 'live',
    smallText: 'ON-MIC Crystal Clear (Zero-Drop)',
    status: 'online',
    timestampsEnabled: true,
    partySize: 1,
    partyMax: 1
  };

  const [rpcState, setRpcState] = useState<RichPresenceCustomConfig>(currentRpc);
  const [appliedToast, setAppliedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Image upload and internal cropping state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);
  const [cropShape, setCropShape] = useState<'square' | 'circle'>('square');
  const [isCroppingOpen, setIsCroppingOpen] = useState<boolean>(false);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(
    rpcState.customImageBase64 || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Render cropped image to canvas
  const updateCropCanvas = () => {
    if (!sourceImageRef.current || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = sourceImageRef.current;
    const size = 320; // Internal crop resolution
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    if (cropShape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    // Calculate dimensions with zoom and offsets
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const srcSize = minDim / cropZoom;
    const srcX = Math.max(0, Math.min(img.naturalWidth - srcSize, (img.naturalWidth - srcSize) / 2 + cropOffsetX * (img.naturalWidth / 200)));
    const srcY = Math.max(0, Math.min(img.naturalHeight - srcSize, (img.naturalHeight - srcSize) / 2 + cropOffsetY * (img.naturalHeight / 200)));

    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

    if (cropShape === 'circle') {
      ctx.restore();
    }
  };

  useEffect(() => {
    if (rawImageSrc && sourceImageRef.current) {
      updateCropCanvas();
    }
  }, [cropZoom, cropOffsetX, cropOffsetY, cropShape, rawImageSrc]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setRawImageSrc(result);
      setIsCroppingOpen(true);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);

      const img = new Image();
      img.onload = () => {
        sourceImageRef.current = img;
        updateCropCanvas();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = () => {
    if (!previewCanvasRef.current) return;
    const dataUrl = previewCanvasRef.current.toDataURL('image/png');
    setCroppedPreviewUrl(dataUrl);
    setRpcState((prev) => ({
      ...prev,
      customImageBase64: dataUrl,
      customImageFileName: 'custom_presence.png',
      largeImage: 'assets/custom_presence.png'
    }));

    onUpdateVoiceConfig({
      ...voiceConfig,
      richPresence: {
        ...rpcState,
        customImageBase64: dataUrl,
        customImageFileName: 'custom_presence.png',
        largeImage: 'assets/custom_presence.png'
      }
    });

    setIsCroppingOpen(false);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  const handleRemoveCustomImage = () => {
    setCroppedPreviewUrl(null);
    setRawImageSrc(null);
    setRpcState((prev) => ({
      ...prev,
      customImageBase64: undefined,
      customImageFileName: undefined,
      largeImage: 'youtube'
    }));

    onUpdateVoiceConfig({
      ...voiceConfig,
      richPresence: {
        ...rpcState,
        customImageBase64: undefined,
        customImageFileName: undefined,
        largeImage: 'youtube'
      }
    });
  };

  const handleApply = () => {
    onUpdateVoiceConfig({
      ...voiceConfig,
      richPresence: rpcState
    });
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2500);
  };

  const handleCopyEnv = () => {
    const snippet = `# Discord Rich Presence (Activity) Settings - Ubuntu 24.04 (1 Dedicated vCPU)
ACTIVITY_NAME=${rpcState.name}
ACTIVITY_TYPE=${rpcState.type}
ACTIVITY_URL=${rpcState.url}
ACTIVITY_DETAILS=${rpcState.details}
ACTIVITY_STATE=${rpcState.state}
ACTIVITY_LARGE_IMAGE=${rpcState.largeImage}
ACTIVITY_LARGE_TEXT=${rpcState.largeText}
ACTIVITY_SMALL_IMAGE=${rpcState.smallImage}
ACTIVITY_SMALL_TEXT=${rpcState.smallText}
`;
    navigator.clipboard.writeText(snippet);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Kontrol Kustomisasi Rich Presence &amp; Pemotong Gambar Internal</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  Ekspresif &amp; Siap ZIP
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Buat status profil akun Discord Anda tampil ekspresif. Unggah dan potong/select gambar langsung di web, atur status LIVE streaming ungu, teks aktivitas, dan gambar otomatis diteruskan ke dalam file ZIP (<code className="text-purple-300">assets/custom_presence.png</code>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyEnv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
              <span>{copiedToast ? 'Tersalin!' : 'Salin Variabel RPC'}</span>
            </button>
            <button
              onClick={handleApply}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{appliedToast ? 'Tersimpan!' : 'Terapkan Pengaturan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Image Upload & Crop Studio Card */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Studio Unggah &amp; Potong Gambar Internal (Image Cropper)</span>
                {croppedPreviewUrl && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Aset Kustom Aktif
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Gambar yang dipotong akan diteruskan otomatis ke <code className="text-purple-300">assets/custom_presence.png</code> saat Anda mengunduh ZIP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Gambar Baru</span>
            </button>
            {croppedPreviewUrl && (
              <button
                type="button"
                onClick={handleRemoveCustomImage}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-xs transition-colors"
                title="Hapus aset custom dan gunakan ikon default"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal / Inline Cropping Workspace */}
        {isCroppingOpen && rawImageSrc && (
          <div className="p-4 bg-slate-950 border border-purple-500/40 rounded-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5" />
                Atur &amp; Potong Bagian Gambar yang Diinginkan
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropShape('square')}
                  className={`px-2 py-0.5 rounded text-[11px] ${cropShape === 'square' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Kotak (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setCropShape('circle')}
                  className={`px-2 py-0.5 rounded text-[11px] ${cropShape === 'circle' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Lingkaran (Avatar)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Canvas Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <canvas
                  ref={previewCanvasRef}
                  className={`max-w-[200px] max-h-[200px] shadow-lg border-2 border-purple-500/60 ${cropShape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
                />
                <span className="text-[10px] text-slate-400 mt-2 font-mono">Hasil Potongan 320x320 PNG</span>
              </div>

              {/* Sliders for Zoom & Pan */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-sky-400" /> Skala / Zoom:</span>
                    <span className="font-mono text-purple-300">{cropZoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Move className="w-3 h-3 text-sky-400" /> Posisi Horizontal (X):</span>
                    <span className="font-mono text-purple-300">{cropOffsetX}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropOffsetX}
                    onChange={(e) => setCropOffsetX(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Move className="w-3 h-3 text-sky-400" /> Posisi Vertikal (Y):</span>
                    <span className="font-mono text-purple-300">{cropOffsetY}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropOffsetY}
                    onChange={(e) => setCropOffsetY(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCropZoom(1);
                      setCropOffsetX(0);
                      setCropOffsetY(0);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                  >
                    Reset Posisi
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Potong &amp; Simpan Sebagai Aset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status of uploaded asset */}
        {croppedPreviewUrl && !isCroppingOpen && (
          <div className="flex items-center gap-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <img
              src={croppedPreviewUrl}
              alt="Custom Presence"
              className="w-12 h-12 rounded-lg object-cover border border-purple-500/50 shadow"
            />
            <div className="text-xs flex-1 min-w-0">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Gambar Rich Presence Aktif (<code className="text-purple-300">assets/custom_presence.png</code>)</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Aset ini tampil langsung di profil Discord bot dan otomatis dikemas saat Anda mengunduh ZIP.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCroppingOpen(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700"
            >
              Potong Ulang
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
        {/* Left: Customization Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Parameter Aktivitas Discord Ekspresif</span>
          </h3>

          {/* Quick Presets for 1 Dedicated vCPU 480-720p 30-35fps */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium block">Pilihan Preset Cepat (One-Click Setup):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setRpcState({
                  name: 'YouTube Live Screen-Share',
                  type: 'STREAMING',
                  url: 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ',
                  details: 'Infinite (720p Screen-Share)',
                  state: 'Menyiarkan MP4 720p @ 35 FPS (1 vCPU Dedicated)',
                  largeImage: croppedPreviewUrl ? 'assets/custom_presence.png' : 'youtube',
                  largeText: '720p 35FPS Go-Live Screen-Share (1 Dedicated vCPU)',
                  smallImage: 'live',
                  smallText: 'ON-MIC Crystal Clear (Zero-Drop)',
                  status: 'online',
                  timestampsEnabled: true
                })}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-semibold text-purple-300 flex items-center gap-1">🌸 Yamada 720p</div>
                <div className="text-[10px] text-slate-400 truncate">720p @ 35FPS Smooth</div>
              </button>

              <button
                type="button"
                onClick={() => setRpcState({
                  name: 'AIZO Broadcast Stream',
                  type: 'STREAMING',
                  url: 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ',
                  details: 'AIZO (愛蔵) - Screen-Share Broadcast',
                  state: 'Fluid-Motion 480p @ 35 FPS (Low Latency)',
                  largeImage: croppedPreviewUrl ? 'assets/custom_presence.png' : 'youtube',
                  largeText: 'AIZO 480p 35 FPS (Zero-Lag Guaranteed)',
                  smallImage: 'live',
                  smallText: 'ON-MIC High Loudness',
                  status: 'online',
                  timestampsEnabled: true
                })}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-semibold text-sky-300 flex items-center gap-1">💎 AIZO 35FPS</div>
                <div className="text-[10px] text-slate-400 truncate">愛蔵 480p Fluid</div>
              </button>

              <button
                type="button"
                onClick={() => setRpcState({
                  name: 'Ubuntu 24.04 Media Master',
                  type: 'STREAMING',
                  url: 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ',
                  details: '24/7 MP4 Priority Screen-Share',
                  state: '1 Dedicated vCPU / 1GB RAM / Systemd 24.04',
                  largeImage: croppedPreviewUrl ? 'assets/custom_presence.png' : 'youtube',
                  largeText: 'Ubuntu 24.04 LTS Noble Numbat 2026',
                  smallImage: 'live',
                  smallText: 'Always ON-MIC Active',
                  status: 'online',
                  timestampsEnabled: true
                })}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-semibold text-emerald-300 flex items-center gap-1">🐧 Ubuntu 24.04</div>
                <div className="text-[10px] text-slate-400 truncate">Dedicated Engine</div>
              </button>

              <button
                type="button"
                onClick={() => setRpcState({
                  name: 'Studio Master Music DJ',
                  type: 'LISTENING',
                  url: 'https://open.spotify.com',
                  details: 'Japanese High-Energy City Pop & Rock',
                  state: 'Stereo Opus 48kHz (+3.2dB DynAudNorm)',
                  largeImage: croppedPreviewUrl ? 'assets/custom_presence.png' : 'spotify',
                  largeText: 'TruePeak Lookahead Limiter -0.27dBFS',
                  smallImage: 'headphones',
                  smallText: 'Crystal Clear Audio',
                  status: 'online',
                  timestampsEnabled: true
                })}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 text-left transition-colors text-[11px]"
              >
                <div className="font-semibold text-amber-300 flex items-center gap-1">🎧 DJ Studio</div>
                <div className="text-[10px] text-slate-400 truncate">Audio Priority</div>
              </button>
            </div>
          </div>

          {/* Activity Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium block">Tipe Aktivitas (Presence Type):</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: 'STREAMING', label: 'Streaming (LIVE)', icon: Tv, color: 'text-purple-400' },
                { type: 'PLAYING', label: 'Playing Game', icon: Gamepad2, color: 'text-emerald-400' },
                { type: 'LISTENING', label: 'Listening Music', icon: Headphones, color: 'text-sky-400' },
                { type: 'WATCHING', label: 'Watching Video', icon: Eye, color: 'text-amber-400' },
                { type: 'COMPETING', label: 'Competing In', icon: Trophy, color: 'text-rose-400' }
              ].map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = rpcState.type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setRpcState({ ...rpcState, type: opt.type as any })}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${opt.color}`} />
                    <span className="font-semibold text-[11px] truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Nama Aplikasi / Game:</label>
              <input
                type="text"
                value={rpcState.name}
                onChange={(e) => setRpcState({ ...rpcState, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
                placeholder="YouTube Live Screen-Share"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Status Akun (User Status):</label>
              <select
                value={rpcState.status}
                onChange={(e) => setRpcState({ ...rpcState, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              >
                <option value="online">Online (Hijau - Siaran Aktif)</option>
                <option value="idle">Idle (Kuning / Istirahat Anti-Deteksi)</option>
                <option value="dnd">Do Not Disturb (Merah - Fokus Studio)</option>
              </select>
            </div>
          </div>

          {/* Details & State */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Baris Detail (Judul Lagu / Tayangan Video):</label>
            <input
              type="text"
              value={rpcState.details}
              onChange={(e) => setRpcState({ ...rpcState, details: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              placeholder="Infinite (720p Screen-Share)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Baris State (Sub-Status / Resolusi &amp; FPS):</label>
            <input
              type="text"
              value={rpcState.state}
              onChange={(e) => setRpcState({ ...rpcState, state: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              placeholder="Menyiarkan MP4 480p-720p @ 30-35 FPS (Go-Live)"
            />
          </div>

          {/* Stream URL */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">URL Streaming (Memunculkan Badge LIVE Ungu &amp; Tombol Tonton):</label>
            <input
              type="text"
              value={rpcState.url}
              onChange={(e) => setRpcState({ ...rpcState, url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              placeholder="https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ"
            />
          </div>

          {/* Large Image & Small Image Assets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Asset Gambar Besar (Tooltip):</label>
              <input
                type="text"
                value={rpcState.largeText}
                onChange={(e) => setRpcState({ ...rpcState, largeText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                placeholder="720p 35FPS Go-Live Screen-Share"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Asset Gambar Kecil (Badge Tooltip):</label>
              <input
                type="text"
                value={rpcState.smallText}
                onChange={(e) => setRpcState({ ...rpcState, smallText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                placeholder="ON-MIC Crystal Clear (Zero-Drop)"
              />
            </div>
          </div>
        </div>

        {/* Right: Pixel-Perfect Live Discord Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Live Preview Kartu Profil Discord
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Sesuai Klien Asli</span>
          </div>

          {/* Discord Card Mockup */}
          <div className="rounded-2xl bg-[#111214] border border-[#232428] p-4 text-white shadow-2xl font-sans relative overflow-hidden">
            {/* Header banner gradient with audio visualizer glow */}
            <div className="h-16 -mx-4 -mt-4 bg-gradient-to-r from-purple-800 via-indigo-700 to-sky-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 right-3 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-[10px] text-white/90 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Ubuntu 24.04 DAVE</span>
              </div>
            </div>

            {/* Avatar & Status Indicator */}
            <div className="relative -mt-8 mb-3 flex items-end justify-between">
              <div className="relative">
                {croppedPreviewUrl ? (
                  <img
                    src={croppedPreviewUrl}
                    alt="Custom Avatar"
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#111214] shadow-md bg-[#1e1f22]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#5865F2] border-4 border-[#111214] flex items-center justify-center font-bold text-xl text-white shadow-md">
                    F
                  </div>
                )}
                {/* On-Mic Speaking Green Ring Animation */}
                <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-[#111214] ${
                  rpcState.status === 'online' ? 'bg-[#23a55a]' : rpcState.status === 'idle' ? 'bg-[#f0b232]' : 'bg-[#f23f43]'
                }`} />
              </div>

              {rpcState.type === 'STREAMING' && (
                <div className="bg-[#593695] text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>STREAMING</span>
                </div>
              )}
            </div>

            {/* User display */}
            <div className="border-b border-[#232428] pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-base text-white leading-tight">fadhilbot</h4>
                <span className="text-[10px] bg-[#5865F2]/30 text-[#8ea1e1] px-1.5 py-0.2 rounded font-mono font-bold">1 vCPU</span>
              </div>
              <p className="text-xs text-[#949ba4] font-mono">fadhilbot#0000</p>
            </div>

            {/* Rich Presence Activity Box */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-[#b5bac1] tracking-wider flex items-center justify-between">
                <span>{rpcState.type === 'STREAMING' ? 'STREAMING DI YOUTUBE' : `SEDANG ${rpcState.type}`}</span>
                <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ON-MIC AKTIF
                </span>
              </div>

              <div className="flex items-start gap-3 bg-[#1e1f22] p-3 rounded-xl border border-[#2b2d31]">
                {/* Large & Small Asset Icon */}
                <div className="relative shrink-0">
                  {croppedPreviewUrl ? (
                    <img
                      src={croppedPreviewUrl}
                      alt="Presence Artwork"
                      className="w-14 h-14 rounded-xl object-cover border border-purple-500/40 shadow-inner"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-red-600/90 flex items-center justify-center text-white shadow-inner font-bold text-xs overflow-hidden">
                      <Tv className="w-7 h-7 text-white" />
                    </div>
                  )}

                  {/* Small Icon Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600 border-2 border-[#1e1f22] flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                    ●
                  </div>
                </div>

                {/* Activity Details */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="font-bold text-sm text-white truncate" title={rpcState.name}>
                    {rpcState.name}
                  </div>
                  <div className="text-xs text-[#dbdee1] truncate font-medium" title={rpcState.details}>
                    {rpcState.details}
                  </div>
                  <div className="text-xs text-[#949ba4] truncate" title={rpcState.state}>
                    {rpcState.state}
                  </div>
                  <div className="text-[11px] text-[#949ba4] font-mono pt-0.5 flex items-center gap-1.5">
                    <span>00:14:28 berlalu</span>
                    <span>•</span>
                    <span className="text-purple-300 font-semibold">30-35 FPS</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                {rpcState.type === 'STREAMING' && (
                  <a
                    href={rpcState.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-[#2b2d31] hover:bg-[#35373c] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#3b3e45]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tonton Siaran</span>
                  </a>
                )}
                <div className="w-full py-1.5 bg-[#18191c] text-[#80848e] text-[11px] font-mono rounded-lg flex items-center justify-center gap-2 border border-[#232428]">
                  <span>Engine: Ubuntu 24.04 (1 Dedicated vCPU)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
