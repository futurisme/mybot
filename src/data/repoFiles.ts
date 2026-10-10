import { BotMode, RepoFile, VoiceConfig } from '../types';
import indexJsRaw from '../../index.js?raw';
import indexCjsRaw from '../../index.cjs?raw';
import packageJsonRaw from '../../package.json?raw';
import configJsonRaw from '../../config.json?raw';
import envExampleRaw from '../../.env.example?raw';
import readmeRaw from '../../README.md?raw';
import postinstallRaw from '../../scripts/postinstall.cjs?raw';
import npmrcRaw from '../../.npmrc?raw';
import serviceRaw from '../../fadhilbot.service?raw';
import setupScriptRaw from '../../setup-ubuntu-24-04.sh?raw';

export function getRepositoryFiles(
  mode: BotMode,
  userToken: string,
  maskToken: boolean,
  voiceConfig?: VoiceConfig
): RepoFile[] {
  const DEFAULT_VOICE_CHANNEL_ID = '1366441630151737445';
  const DEFAULT_GUILD_ID = '1323944038117675038';

  const effectiveChannelId = (voiceConfig?.channelId && voiceConfig.channelId.trim() !== '')
    ? voiceConfig.channelId.trim()
    : DEFAULT_VOICE_CHANNEL_ID;

  const effectiveGuildId = (voiceConfig?.guildId && voiceConfig.guildId.trim() !== '')
    ? voiceConfig.guildId.trim()
    : DEFAULT_GUILD_ID;

  const rawToken = userToken.trim();
  const displayToken = maskToken 
    ? (rawToken.length > 15 ? `${rawToken.substring(0, 15)}...[PROTECTED_TOKEN]` : rawToken)
    : rawToken;

  const defaultVoice: VoiceConfig = voiceConfig || {
    channelId: DEFAULT_VOICE_CHANNEL_ID,
    guildId: DEFAULT_GUILD_ID,
    selfDeaf: false,
    selfMute: false,
    autoRejoin: true,
    rejoinDelaySec: 5,
    liveStream: {
      enabled: true,
      youtubeUrl: 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ',
      title: 'Infinite ↔ AIZO (480p-720p 30-35 FPS)',
      autoLoop: true,
      hourlyBreakEnabled: true,
      breakDurationMinutes: 1.5,
      hourlyIntervalMinutes: 120,
      audioVolume: 1.45,
      streamType: 'screenshare',
      videoMinResolution: '480p',
      videoMaxResolution: '720p',
      videoFps: 30,
      priorityMode: 'mp4_screenshare_primary'
    }
  };

  // 1. Sinkronisasi token dan ID ke dalam index.js
  let finalIndexJs = indexJsRaw;
  if (rawToken && rawToken !== 'MASUKKAN_TOKEN_DISCORD_ANDA_DISINI') {
    finalIndexJs = finalIndexJs.replace(
      /: '1366441630151737445';/g,
      `: '${effectiveChannelId}';`
    );
    if (effectiveGuildId) {
      finalIndexJs = finalIndexJs.replace(
        /: '1323944038117675038';/g,
        `: '${effectiveGuildId}';`
      );
    }
  }

  // 2. Sinkronisasi ke dalam index.cjs
  let finalIndexCjs = indexCjsRaw;
  if (rawToken && rawToken !== 'MASUKKAN_TOKEN_DISCORD_ANDA_DISINI') {
    finalIndexCjs = finalIndexCjs.replace(
      /: '1366441630151737445';/g,
      `: '${effectiveChannelId}';`
    );
    if (effectiveGuildId) {
      finalIndexCjs = finalIndexCjs.replace(
        /: '1323944038117675038';/g,
        `: '${effectiveGuildId}';`
      );
    }
  }

  const rpc = voiceConfig?.richPresence;

  // 3. .env aktif yang sinkron dengan input form & spesifikasi 1 vCPU / 1GB RAM / Ubuntu 24.04
  const envContent = `# ================================================================
# KONFIGURASI DISCORD 24/7 MP4 SCREEN-SHARE & ON-MIC AUDIO ENGINE (2026)
# Platform: Linux Ubuntu 24.04 LTS (1 Dedicated vCPU, 1GB RAM, 20GB Disk)
# ================================================================

DISCORD_TOKEN=${displayToken}
PORT=3000

# Voice 24/7 Channel Target
VOICE_CHANNEL_ID=${effectiveChannelId}
VOICE_GUILD_ID=${effectiveGuildId}
GUILD_ID=${effectiveGuildId}
VOICE_AUTO_REJOIN=${defaultVoice.autoRejoin}
VOICE_REJOIN_DELAY_SEC=${defaultVoice.rejoinDelaySec}

# MP4 Screen-Share Priority Engine (Konsisten 480p-720p @ 30-35 FPS)
ENABLE_STREAM=true
AUTO_LOOP=true
VIDEO_RESOLUTION_MIN=480p
VIDEO_RESOLUTION_MAX=720p
VIDEO_WIDTH=1280
VIDEO_HEIGHT=720
VIDEO_FPS_MIN=30
VIDEO_FPS_MAX=35
VIDEO_FPS=30
VIDEO_BITRATE=1600
VIDEO_BITRATE_MAX=2200

# Audio On-Mic MP3 Studio Settings (Jernih & Volume Keras Terkunci Zero-Drop)
AUDIO_BITRATE=192
AUDIO_BOOST=1.45
AUDIO_PRIORITY=crystal_clear_zero_drop

# Alokasi Daya Komputasi 1 Dedicated vCPU (Ceiling 100%, Target 75-85%)
FFMPEG_THREADS=2
NODE_OPTIONS="--max-old-space-size=512"

# Kustomisasi Discord Rich Presence Ekspresif
ACTIVITY_NAME=${rpc?.name || 'YouTube Live Screen-Share'}
ACTIVITY_TYPE=${rpc?.type || 'STREAMING'}
ACTIVITY_URL=${rpc?.url || 'https://youtu.be/L5rL0pBzmAE?si=xf2mlt5z4RFJikLJ'}
ACTIVITY_DETAILS=${rpc?.details || 'Infinite (720p Screen-Share)'}
ACTIVITY_STATE=${rpc?.state || 'Menyiarkan MP4 480p-720p @ 30-35 FPS (Go-Live)'}
ACTIVITY_LARGE_IMAGE=${rpc?.largeImage || 'assets/custom_presence.png'}
ACTIVITY_LARGE_TEXT=${rpc?.largeText || '720p 35FPS Go-Live Screen-Share (1 Dedicated vCPU)'}
ACTIVITY_SMALL_IMAGE=${rpc?.smallImage || 'live'}
ACTIVITY_SMALL_TEXT=${rpc?.smallText || 'ON-MIC Crystal Clear (Zero-Drop)'}

# Anti-Deteksi Discord: Jeda Istirahat 1-2 Menit Setiap 2 Jam
TWO_HOUR_BREAK_ENABLED=true
BREAK_INTERVAL_MINUTES=120
BREAK_DURATION_SECONDS=90
`;

  // 4. config.json tersinkronisasi
  let parsedConfig: Record<string, unknown> = {};
  try {
    parsedConfig = JSON.parse(configJsonRaw);
  } catch (_) {
    parsedConfig = {};
  }

  // Inject updated channel IDs and RPC
  const finalConfigObj = {
    ...parsedConfig,
    voice: {
      ...(typeof parsedConfig.voice === 'object' && parsedConfig.voice !== null ? parsedConfig.voice : {}),
      channelId: effectiveChannelId,
      guildId: effectiveGuildId,
      autoRejoin: defaultVoice.autoRejoin,
      rejoinDelaySec: defaultVoice.rejoinDelaySec,
      onMicPriority: true,
      permanentSpeaking: true
    },
    richPresence: {
      name: rpc?.name || 'YouTube Live Screen-Share',
      type: rpc?.type || 'STREAMING',
      details: rpc?.details || 'Infinite (720p Screen-Share)',
      state: rpc?.state || 'Menyiarkan MP4 480p-720p @ 30-35 FPS (Go-Live)',
      largeImage: rpc?.largeImage || 'assets/custom_presence.png',
      largeText: rpc?.largeText || '720p 35FPS Go-Live Screen-Share (1 Dedicated vCPU)',
      smallImage: rpc?.smallImage || 'live',
      smallText: rpc?.smallText || 'ON-MIC Crystal Clear (Zero-Drop)',
      customAssetEnabled: true
    }
  };
  const finalConfigJson = JSON.stringify(finalConfigObj, null, 2);

  return [
    {
      name: 'index.js',
      path: 'index.js',
      type: 'file',
      size: `${(finalIndexJs.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat(engine): 1 dedicated vCPU, MP4 screenshare priority 480p-720p 30-35fps, 1GB RAM safeguards',
      lastCommitDate: 'Just now',
      content: finalIndexJs,
      language: 'javascript',
      description: 'Skrip utama Node.js 2026: MP4 480p-720p 30-35fps prioritas, audio on-mic crystal clear zero-drop, 1 dedicated vCPU governor'
    },
    {
      name: 'index.cjs',
      path: 'index.cjs',
      type: 'file',
      size: `${(finalIndexCjs.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat(stream): native CommonJS entry point for 1 dedicated vCPU & 1GB RAM',
      lastCommitDate: 'Just now',
      content: finalIndexCjs,
      language: 'javascript',
      description: 'Skrip alternatif CommonJS native untuk VPS Ubuntu 24.04 (1 dedicated vCPU)'
    },
    {
      name: 'fadhilbot.service',
      path: 'fadhilbot.service',
      type: 'file',
      size: `${(serviceRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat(systemd): Ubuntu 24.04 24/7 service unit with auto-restart & memory limits',
      lastCommitDate: 'Just now',
      content: serviceRaw,
      language: 'ini',
      description: 'Systemd service file untuk Ubuntu 24.04 (otomatis hidup selamanya & auto-start saat reboot server)'
    },
    {
      name: 'setup-ubuntu-24-04.sh',
      path: 'setup-ubuntu-24-04.sh',
      type: 'file',
      size: `${(setupScriptRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat(deploy): automated installer script for Ubuntu 24.04 LTS with 2GB swap',
      lastCommitDate: 'Just now',
      content: setupScriptRaw,
      language: 'shell',
      description: 'Skrip instalasi otomatis di Ubuntu 24.04: konfigurasi swap 2GB, ffmpeg, nodejs, dan systemd service'
    },
    {
      name: 'scripts/postinstall.cjs',
      path: 'scripts/postinstall.cjs',
      type: 'file',
      size: `${(postinstallRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'fix(webrtc): patch WebRTC GLIBC, PacingHandler setBitrate & BaseMediaStream safeDelay',
      lastCommitDate: 'Just now',
      content: postinstallRaw,
      language: 'javascript',
      description: 'Skrip otomatis postinstall untuk patch WebRTC GLIBC dan pencegahan Discord Error 2012'
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file',
      size: `${(packageJsonRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat: configure start scripts, DAVE E2EE, and undici v6 overrides',
      lastCommitDate: 'Just now',
      content: packageJsonRaw,
      language: 'json',
      description: 'Daftar dependensi dengan DAVE E2EE & WebRTC SAVPF'
    },
    {
      name: '.env',
      path: '.env',
      type: 'file',
      size: `${(envContent.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'config: synced token, MP4 480p-720p 30-35fps, 1 vCPU governor settings',
      lastCommitDate: 'Just now',
      content: envContent,
      language: 'shell',
      description: 'Konfigurasi token tersinkronisasi, channel ID, resolusi 480p-720p, dan 1 vCPU governor'
    },
    {
      name: '.env.example',
      path: '.env.example',
      type: 'file',
      size: `${(envExampleRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'docs: template environment configuration with 1 vCPU & MP4 priority defaults',
      lastCommitDate: 'Just now',
      content: envExampleRaw,
      language: 'shell',
      description: 'Template contoh .env dengan spesifikasi 1 dedicated vCPU, 1GB RAM, dan MP4 priority'
    },
    {
      name: 'config.json',
      path: 'config.json',
      type: 'file',
      size: `${(finalConfigJson.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'feat: centralized 480p-720p 30-35fps mediaEngine, 1 vCPU governor, systemd service config',
      lastCommitDate: 'Just now',
      content: finalConfigJson,
      language: 'json',
      description: 'Pengaturan terpusat playlist bergilir, batas 1 vCPU Governor 75-85%, dan systemd service'
    },
    {
      name: '.npmrc',
      path: '.npmrc',
      type: 'file',
      size: `${(npmrcRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'config: suppress engine strict warnings on Node',
      lastCommitDate: 'Just now',
      content: npmrcRaw,
      language: 'shell',
      description: 'Konfigurasi npm untuk kompatibilitas Node & bypass audit'
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      size: `${(readmeRaw.length / 1024).toFixed(1)} KB`,
      lastCommitMessage: 'docs: complete documentation for Ubuntu 24.04 LTS (1 Dedicated vCPU, 1GB RAM)',
      lastCommitDate: 'Just now',
      content: readmeRaw,
      language: 'markdown',
      description: 'Panduan lengkap hosting 24/7 di Ubuntu 24.04 LTS dengan systemd & MP4 480p-720p priority'
    }
  ];
}
