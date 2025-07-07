import { DownloadOptions } from "./request";

const options = {
  audioBitrate: [
    {
      keyword: ["320kbps", "320", "320k"],
      value: "320",
    },
    {
      keyword: ["256kbps", "256", "256k"],
      value: "256",
    },
    {
      keyword: ["128kbps", "128", "128k"],
      value: "128",
    },
    {
      keyword: ["96kbps", "96", "96k"],
      value: "96",
    },
    {
      keyword: ["64kbps", "64", "64k"],
      value: "64",
    },
    {
      keyword: ["8kbps", "8"],
      value: "8",
    },
  ],
  audioFormat: [
    {
      keyword: ["mp3", ".mp3"],
      value: "mp3",
    },
    {
      keyword: ["ogg", ".ogg"],
      value: "ogg",
    },
    {
      keyword: ["wav", ".wav"],
      value: "wav",
    },
    {
      keyword: ["opus", ".opus"],
      value: "opus",
    },
  ],
  downloadMode: [
    {
      keyword: ["audio"],
      value: "audio",
    },
    {
      keyword: ["mute", "silent"],
      value: "mute",
    },
  ],
  filenameStyle: [
    {
      keyword: ["classic"],
      value: "classic",
    },
    {
      keyword: ["pretty"],
      value: "pretty",
    },
    {
      keyword: ["basic"],
      value: "basic",
    },
    {
      keyword: ["nerdy"],
      value: "nerdy",
    },
  ],
  videoQuality: [
    {
      keyword: ["max", "highest", "best"],
      value: "max",
    },
    {
      keyword: ["4320p", "4320", "8k"],
      value: "4320",
    },
    {
      keyword: ["2160p", "2160", "4k"],
      value: "2160",
    },
    {
      keyword: ["1440p", "1440"],
      value: "1440",
    },
    {
      keyword: ["1080p", "1080"],
      value: "1080",
    },
    {
      keyword: ["720p", "720"],
      value: "720",
    },
    {
      keyword: ["480p", "480"],
      value: "480",
    },
    {
      keyword: ["360p", "360"],
      value: "360",
    },
    {
      keyword: ["240p", "240"],
      value: "240",
    },
    {
      keyword: ["144p", "144"],
      value: "144",
    },
  ],
  youtubeVideoCodec: [
    {
      keyword: ["h264", "h.264", "avc"],
      value: "h264",
    },
    {
      keyword: ["av1", "av-1", "av-one"],
      value: "av1",
    },
    {
      keyword: ["vp9", "vp-9"],
      value: "vp9",
    },
  ],
  youtubeVideoContainer: [
    {
      keyword: ["auto"],
      value: "auto",
    },
    {
      keyword: ["mp4", ".mp4"],
      value: "mp4",
    },
    {
      keyword: ["webm", ".webm"],
      value: "webm",
    },
    {
      keyword: ["mkv", ".mkv"],
      value: "mkv",
    },
  ],
};

const booleanOptions = {
  disableMetadata: [
    {
      keyword: ["no-metadata", "nometadata", "disable-metadata", "disablemetadata"],
      value: true,
    },
  ],
  convertGif: [
    {
      keyword: ["convertgif", "convert-gif", "gif"],
      value: true,
    },
  ],
  allowH265: [
    {
      keyword: ["allow-h265", "allowh265", "h265", "hevc"],
      value: true,
    },
  ],
  tiktokFullAudio: [
    {
      keyword: ["tiktok-full-audio", "tiktokfullaudio", "tiktokoriginalaudio", "tiktok-original-audio"],
      value: true,
    },
  ],
};

export function guessDownloadOptions(input: string): Omit<DownloadOptions, "url"> {
  const words = input.toLowerCase().split(" ");

  const optionsGuess: Omit<DownloadOptions, "url"> = {};

  for (const [option, values] of Object.entries(options)) {
    for (const value of values) {
      if (value.keyword.some((keyword) => words.includes(keyword))) {
        // @ts-ignore headache
        optionsGuess[option] = value.value;

        if (option === "audioFormat") {
          // If audioFormat is set, we can assume downloadMode is audio
          optionsGuess.downloadMode = "audio";
        }

        break;
      }
    }
  }

  return optionsGuess;
}
