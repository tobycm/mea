import Bot from "Bot";

import { DownloadOptions } from "modules/cobalt/request";

import { Events } from "discord.js";
import { guessDownloadOptions } from "modules/cobalt/optionsGuessing";
import { ffmpegDownload, maxFileSize, niceBytes, timeRegex } from "modules/utils";

type Config = Omit<DownloadOptions, "url">;

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    try {
      let config: Config | null | undefined = message.client.cache.get(`servers:${message.guild.id}:autodownload:${message.channel.id}`) as
        | Config
        | null
        | undefined;

      if (config === undefined) {
        // cache miss
        config = (await message.client.db.ref("servers").child(message.guild.id).child("autodownload").child(message.channel.id).get<Config>()).val();
        message.client.cache.set(`servers:${message.guild.id}:autodownload:${message.channel.id}`, config);
      }

      if (!config) return;

      const url = message.content.match(/https:\/\/[^\s/$.?#].[^\s]*/);
      if (!url) return;

      const guessedOptions = guessDownloadOptions(message.content.slice(url.index! + url[0].length).trim());

      const downloadOptions = {
        ...config,
        ...guessedOptions,
      };

      const { audioFormat, downloadMode, youtubeVideoContainer } = downloadOptions;

      const timestamps = message.content
        .slice(url.index! + url[0].length)
        .trim()
        .match(timeRegex);

      let startTime: string | undefined;
      let endTime: string | undefined;

      if (timestamps) {
        if (timestamps[1]) {
          startTime = timestamps[0];
          endTime = timestamps[1];
        } else {
          endTime = timestamps[0];
        }
      }

      const inferredFormat =
        downloadMode === "audio"
          ? audioFormat === "best"
            ? "mp3"
            : audioFormat
          : youtubeVideoContainer && youtubeVideoContainer !== "auto"
          ? youtubeVideoContainer
          : "mp4";

      message.react("<:meabotloading:1391547808552587264>");

      const result = await message.client.cobalt.download({
        url: url[0],
        ...downloadOptions,
      });

      console.log("Result status:", result.status);

      if (result.status == "error") {
        console.log("Code:", result.error.code);
        message.reactions.removeAll();
        if (result.error.code == "error.api.link.invalid") return;
        message.react("<:error:1391540812634132560>");
        return;
      }

      if (result.status == "tunnel" || result.status == "redirect") {
        let buffer: Buffer | ArrayBuffer;

        if (startTime || endTime) {
          buffer = await ffmpegDownload({
            input: result.url,
            filename: result.filename || `download-${Date.now()}.${inferredFormat}`,
            startTime,
            endTime,
          });
        } else {
          const file = await fetch(result.url);

          const contentLength = file.headers.get("content-length") || file.headers.get("estimated-content-length");
          console.log(`Content-Length: ${niceBytes(parseInt(contentLength ?? "0", 10))}`);

          if (!contentLength) {
            // handle error with reactions in the future
            message.reactions.removeAll();
            message.react("<:error:1391540812634132560>");
            return;
          }

          let size = parseInt(contentLength, 10);

          if (downloadMode === "audio") {
            size /= 8; // cobalt estimation is not very good for audio file
          }

          if (size > maxFileSize(message.guild?.premiumTier)) {
            message.reactions.removeAll();
            message.react("<:toolarge:1391540759894691962>");
            return;
          }

          if (!file.ok) {
            message.reactions.removeAll();
            message.react("<:error:1391540812634132560>");
            return;
          }

          buffer = await file.arrayBuffer();
        }

        if (buffer.byteLength > maxFileSize(message.guild?.premiumTier)) {
          message.reactions.removeAll();
          message.react("<:toolarge:1391540759894691962>");
          return;
        }

        const filename = result.filename || `download-${Date.now()}.${inferredFormat}`;

        message.channel.send({ files: [{ name: filename, attachment: Buffer.from(buffer) }] });
        message.reactions.removeAll();
        message.react("✅");
      }
    } catch (err) {
      console.error("Error during download:", err);
      try {
        message.reactions.removeAll();
        message.react("<:error:1391540812634132560>");
      } catch (error) {
        /* message is probably gone */
      }
    }
  });
}
