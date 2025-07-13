import { SlashCommandBuilder } from "discord.js";
import { DownloadOptions } from "modules/cobalt/request";
import Command from "modules/command";
import { download, inferExtension, InvalidUrlError, TooLargeError } from "modules/download";
import { maxFileSize, timeRegex } from "modules/utils";

const data = new SlashCommandBuilder().setName("download").setDescription("Download a media link.");

// --- 1. Required Option ---
data.addStringOption((option) =>
  option.setName("link").setDescription("Media link to download (e.g., YouTube video, TikTok, Tweet)").setRequired(true)
);

data.addBooleanOption((option) =>
  option.setName("ephemeral").setDescription("Whether to send the response as ephemeral (only visible to you). Default: false").setRequired(false)
);

data.addStringOption((option) =>
  option
    .setName("start_time")
    .setDescription("Start time for the download in HH:MM:SS format (HH is optional, e.g., 01:23:45 or 23:45 or 0:21)")
    .setRequired(false)
    .setMaxLength(8)
);

data.addStringOption((option) =>
  option
    .setName("end_time")
    .setDescription("End time for the download in HH:MM:SS format (HH is optional, e.g., 01:23:45 or 23:45 or 0:21)")
    .setRequired(false)
    .setMaxLength(8)
);

// --- 2. General Media & Download Options ---
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

// --- 3. Output & Processing Options ---
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

// --- 4. Service-Specific Options ---

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
  async run(interaction) {
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;

    const startTime = interaction.options.getString("start_time");
    const endTime = interaction.options.getString("end_time");

    const link = interaction.options.getString("link", true);
    const downloadMode = interaction.options.getString("download_mode") as DownloadOptions["downloadMode"];
    const quality = interaction.options.getString("quality") as DownloadOptions["videoQuality"];
    const audioFormat = interaction.options.getString("audio_format") as DownloadOptions["audioFormat"];
    const audioBitrate = interaction.options.getString("audio_bitrate") as DownloadOptions["audioBitrate"];
    const filenameStyle = interaction.options.getString("filename_style") as DownloadOptions["filenameStyle"];
    const disableMetadata = interaction.options.getBoolean("disable_metadata");

    const youtubeVideoCodec = interaction.options.getString("youtube_video_codec") as DownloadOptions["youtubeVideoCodec"];
    const youtubeVideoContainer = interaction.options.getString("youtube_video_container") as DownloadOptions["youtubeVideoContainer"];
    const youtubeDubLang = interaction.options.getString("youtube_dub_lang");

    const allowH265 = interaction.options.getBoolean("allow_h265");
    const tiktokFullAudio = interaction.options.getBoolean("tiktok_full_audio");

    const convertGif = interaction.options.getBoolean("convert_gif");

    if ((endTime && !endTime.match(timeRegex)) || (startTime && !startTime.match(timeRegex))) {
      interaction.reply({
        content: `Invalid end time format. Please use HH:MM:SS (e.g, 01:23:45 or 23:45 or 0:21).`,
      });
      return;
    }

    const message = await interaction.reply({ content: "Fetching info...", ephemeral });

    const options = {
      url: link,
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
    };

    Object.keys(options).forEach((key) => {
      if (options[key as keyof typeof options] === null) {
        delete options[key as keyof typeof options];
      }
    });

    const result = await interaction.bot.cobalt.download(options as DownloadOptions);

    if (result.status == "error") throw new Error(`Cobalt download error: ${result.error.code} ${JSON.stringify(result.error.context)}`);

    await message.edit({ content: "Downloading..." });

    try {
      const attachments = await download(result, {
        endTime,
        startTime,
        extension: inferExtension({
          audioFormat,
          downloadMode,
          youtubeVideoContainer,
        }),
        maxFileSize: maxFileSize(interaction.guild?.premiumTier || 0),
        audio: downloadMode === "audio",
      });

      if (!attachments || !attachments.length) {
        message.edit({
          content: "No files were downloaded. Please check the link and try again.",
        });
        return;
      }

      await message.edit({
        content: `Downloaded ${attachments.length} file(s) from <${link}>.\nUploading...`,
      });

      await message.edit({
        content: `-# Downloaded ${attachments.length} file(s) from <${link}>.`,
        files: attachments,
      });
    } catch (error) {
      if (error instanceof TooLargeError && (result.status === "tunnel" || result.status === "redirect")) {
        message.edit({
          content: `The file is too large to download directly. [Click here to download it](${result.url})`,
        });
        return;
      }
      if (error instanceof InvalidUrlError) {
        message.edit({
          content: `Invalid URL provided for cobalt: ${error.url}`,
        });
        return;
      }

      message.edit({
        content: `An error occurred while downloading: ${error}`,
      });
      console.error("Download error:", error);
      return;
    }
  },
});
