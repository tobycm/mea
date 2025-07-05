import { SlashCommandBuilder } from "discord.js";
import { DownloadOptions } from "modules/cobalt/request";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("autodownload").setDescription("Set up autodownloading for this channel.");

data.addStringOption((option) =>
  option
    .setName("download_mode")
    .setDescription("How to download: full video, audio only, or muted video (default: auto)")
    .setRequired(false)
    .setChoices({ name: "Auto (smart detection)", value: "auto" }, { name: "Audio Only", value: "audio" }, { name: "Mute Video", value: "mute" })
);

data.addStringOption((option) =>
  option
    .setName("quality")
    .setDescription("Preferred video quality (default: 1080)")
    .setRequired(false)
    .setChoices(
      { name: "Max (highest available)", value: "max" },
      { name: "4320p (8K)", value: "4320" },
      { name: "2160p (4K)", value: "2160" },
      { name: "1440p (2K/QHD)", value: "1440" },
      { name: "1080p (Full HD)", value: "1080" },
      { name: "720p (HD)", value: "720" },
      { name: "480p (SD)", value: "480" },
      { name: "360p", value: "360" },
      { name: "240p", value: "240" },
      { name: "144p", value: "144" }
    )
);

data.addStringOption((option) =>
  option
    .setName("audio_format")
    .setDescription("Output audio format (default: mp3)")
    .setRequired(false)
    .setChoices(
      { name: "Best (recommended)", value: "best" },
      { name: "MP3", value: "mp3" },
      { name: "OGG", value: "ogg" },
      { name: "WAV", value: "wav" },
      { name: "Opus", value: "opus" }
    )
);

data.addStringOption((option) =>
  option
    .setName("audio_bitrate")
    .setDescription("Audio bitrate in kbps (default: 128)")
    .setRequired(false)
    .setChoices(
      { name: "320 kbps", value: "320" },
      { name: "256 kbps", value: "256" },
      { name: "128 kbps", value: "128" },
      { name: "96 kbps", value: "96" },
      { name: "64 kbps", value: "64" },
      { name: "8 kbps", value: "8" }
    )
);

// --- Output & Processing Options ---
data.addStringOption((option) =>
  option
    .setName("filename_style")
    .setDescription("Style for the output filename (default: basic)")
    .setRequired(false)
    .setChoices(
      { name: "Classic (original URL-based)", value: "classic" },
      { name: "Basic (simple, no extra info)", value: "basic" },
      { name: "Pretty (clean, readable)", value: "pretty" },
      { name: "Nerdy (detailed with IDs)", value: "nerdy" }
    )
);

data.addBooleanOption((option) =>
  option
    .setName("disable_metadata")
    .setDescription("Prevent adding title, artist, and other metadata to the file (default: false)")
    .setRequired(false)
);

// --- Service-Specific Options ---

// YouTube Options
data.addStringOption((option) =>
  option
    .setName("youtube_video_codec")
    .setDescription("YouTube: Preferred video codec (default: h264)")
    .setRequired(false)
    .setChoices(
      { name: "H264 (widely compatible)", value: "h264" },
      { name: "VP9 (Google's codec)", value: "vp9" },
      { name: "AV1 (newer, efficient)", value: "av1" }
    )
);

data.addStringOption((option) =>
  option
    .setName("youtube_video_container")
    .setDescription("YouTube: Preferred video container format (default: auto)")
    .setRequired(false)
    .setChoices(
      { name: "Auto (smart detection)", value: "auto" },
      { name: "MP4", value: "mp4" },
      { name: "WebM", value: "webm" },
      { name: "MKV", value: "mkv" }
    )
);

data.addStringOption((option) =>
  option.setName("youtube_dub_lang").setDescription("YouTube: Download a specific dub language (ISO 639-1 code)").setRequired(false)
);

// TikTok & Xiaohongshu Options
data.addBooleanOption((option) =>
  option.setName("allow_h265").setDescription("TikTok/Xiaohongshu: Allow downloading videos in H265/HEVC codec (default: false)").setRequired(false)
);

data.addBooleanOption((option) =>
  option.setName("tiktok_full_audio").setDescription("TikTok: Download the original sound used in a video (default: false)").setRequired(false)
);

// Twitter/X Options
data.addBooleanOption((option) =>
  option.setName("convert_gif").setDescription("Twitter/X: Convert animated media to actual GIF format (default: true)").setRequired(false)
);

export default new Command({
  data,
  guildOnly: true,
  async run(ctx) {
    const downloadMode = ctx.options.get<string>("download_mode") as DownloadOptions["downloadMode"];
    const quality = ctx.options.get<string>("quality") as DownloadOptions["videoQuality"];
    const audioFormat = ctx.options.get<string>("audio_format") as DownloadOptions["audioFormat"];
    const audioBitrate = ctx.options.get<string>("audio_bitrate") as DownloadOptions["audioBitrate"];
    const filenameStyle = ctx.options.get<string>("filename_style") as DownloadOptions["filenameStyle"];
    const disableMetadata = ctx.options.get<boolean>("disable_metadata");

    const youtubeVideoCodec = ctx.options.get<string>("youtube_video_codec") as DownloadOptions["youtubeVideoCodec"];
    const youtubeVideoContainer = ctx.options.get<string>("youtube_video_container") as DownloadOptions["youtubeVideoContainer"];
    const youtubeDubLang = ctx.options.get<string>("youtube_dub_lang");

    const allowH265 = ctx.options.get<boolean>("allow_h265");
    const tiktokFullAudio = ctx.options.get<boolean>("tiktok_full_audio");

    const convertGif = ctx.options.get<boolean>("convert_gif");

    const message = await ctx.reply("Saving info...");

    await ctx.bot.db.ref("servers").child(ctx.guild.id).child("autodownload").child(ctx.channel.id).set({
      downloadMode,
      videoQuality: quality,
      audioFormat,
      audioBitrate,
      filenameStyle,
      disableMetadata,

      // YouTube-specific options
      youtubeVideoCodec,
      youtubeVideoContainer,
      youtubeDubLang,
      youtubeBetterAudio: true,

      // TikTok/Xiaohongshu-specific options
      allowH265,
      tiktokFullAudio,

      // Twitter/X-specific options
      convertGif,
    });

    message.edit({ content: `Autodownload settings saved for this channel!` });
  },
});
