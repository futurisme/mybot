export type BotMode = 'selfbot' | 'official';

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: string;
  lastCommitMessage: string;
  lastCommitDate: string;
  content: string;
  language: string;
  description: string;
}

export interface TokenAnalysis {
  rawToken: string;
  isValidFormat: boolean;
  snowflakeId?: string;
  createdAtDate?: string;
  timestampEstimate?: string;
  securityAlerts: string[];
  recommendations: string[];
  fixedIssues?: string[];
  caseWarning?: string;
}

export interface LiveStreamConfig {
  enabled: boolean;
  youtubeUrl: string;
  title: string;
  autoLoop: boolean;
  hourlyBreakEnabled: boolean;
  breakDurationMinutes: number; // 1-2 mins
  hourlyIntervalMinutes: number; // 120 mins
  audioVolume: number; // 1.0 - 1.5 (default 1.45)
  streamType: 'screenshare' | 'camera';
  videoMinResolution?: '480p' | '720p' | '360p';
  videoMaxResolution?: '480p' | '720p';
  videoFps?: 30 | 35 | 24;
  adaptiveDiscrimination?: boolean;
  priorityMode?: 'mp4_screenshare_primary' | 'extreme_zero_drop';
  audioPriorityMode?: 'extreme_zero_drop' | 'studio_master';
}

export interface VoiceConfig {
  channelId: string;
  guildId?: string;
  selfDeaf: boolean;
  selfMute: boolean;
  autoRejoin: boolean;
  rejoinDelaySec: number;
  liveStream?: LiveStreamConfig;
  richPresence?: RichPresenceCustomConfig;
}

export interface RichPresenceCustomConfig {
  name: string;
  type: 'STREAMING' | 'PLAYING' | 'LISTENING' | 'WATCHING' | 'COMPETING';
  url: string;
  details: string;
  state: string;
  largeImage: string;
  largeText: string;
  smallImage: string;
  smallText: string;
  status: 'online' | 'idle' | 'dnd';
  customImageBase64?: string; // Uploaded & internally cropped/selected image data URL
  customImageFileName?: string;
  partySize?: number;
  partyMax?: number;
  timestampsEnabled?: boolean;
}

