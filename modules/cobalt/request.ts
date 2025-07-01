export interface DownloadOptions {
  url: string; // required
  audioBitrate?: "320" | "256" | "128" | "96" | "64" | "8"; // default: 128
  audioFormat?: "best" | "mp3" | "ogg" | "wav" | "opus"; // default: mp3
  downloadMode?: "auto" | "audio" | "mute"; // default: auto
  filenameStyle?: "classic" | "pretty" | "basic" | "nerdy"; // default: basic
  videoQuality?: "max" | "4320" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "240" | "144"; // default: 1080
  disableMetadata?: boolean; // default: false
  alwaysProxy?: boolean; // default: false
  localProcessing?: "disabled" | "preferred" | "forced"; // default: disabled
  subtitleLang?: string; // default: none

  // Service-specific options
  youtubeVideoCodec?: "h264" | "av1" | "vp9"; // default: h264
  youtubeVideoContainer?: "auto" | "mp4" | "webm" | "mkv"; // default: auto
  youtubeDubLang?: string; // default: none
  convertGif?: boolean; // default: true
  allowH265?: boolean; // default: false
  tiktokFullAudio?: boolean; // default: false
  youtubeBetterAudio?: boolean; // default: false
  youtubeHLS?: boolean; // default: false
}
