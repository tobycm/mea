import Bot from "Bot";

import { DownloadOptions } from "modules/cobalt/request";

import { Events } from "discord.js";
import { maxFileSize, niceBytes } from "modules/utils";

type Config = Omit<DownloadOptions, "url">;

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

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

    try {
      const result = await message.client.cobalt.download({
        url: url[0],
        ...config,
      });

      console.log("Result status:", result.status);

      if (result.status == "error") {
        console.log("Code:", result.error.code);
      }

      if (result.status == "tunnel" || result.status == "redirect") {
        const file = await fetch(result.url);

        const contentLength = file.headers.get("content-length") || file.headers.get("estimated-content-length");
        console.log(`Content-Length: ${niceBytes(parseInt(contentLength ?? "0", 10))}`);

        if (!contentLength) {
          // handle error with reactions in the future
          return;
        }

        let size = parseInt(contentLength, 10);

        if (config.downloadMode === "audio") {
          size /= 8; // cobalt estimation is not very good for audio file
        }

        if (size > maxFileSize(message.guild?.premiumTier)) {
          // handle error with reactions in the future
          return;
        }

        if (!file.ok) {
          // handle error with reactions in the future
          return;
        }

        const buffer = await file.arrayBuffer();

        const inferredExtension =
          config.downloadMode === "audio"
            ? config.audioFormat === "best"
              ? ".mp3"
              : `.${config.audioFormat}`
            : config.youtubeVideoContainer && config.youtubeVideoContainer !== "auto"
            ? `.${config.youtubeVideoContainer}`
            : ".mp4";

        const filename = result.filename || `download-${Date.now()}${inferredExtension}`;

        await message.channel.send({
          files: [
            {
              name: filename,
              attachment: Buffer.from(buffer),
            },
          ],
        });
      }
    } catch (err) {
      // ignore errors
    }
  });
}
