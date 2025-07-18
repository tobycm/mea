import Bot from "Bot";
import Constants from "modules/constants";

import { Events } from "discord.js";
import { guessDownloadOptions } from "modules/cobalt/optionsGuessing";
import { AutodownloadConfig, download, DownloadError, handleErrors, inferExtension, InvalidUrlError } from "modules/download";
import { maxFileSize, timeRegex } from "modules/utils";

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    const config = (
      await message.client.db.ref("servers").child(message.guild.id).child("autodownload").child(message.channel.id).get<AutodownloadConfig>()
    ).val();
    if (!config) return;

    if (config.prefix && !message.content.startsWith(config.prefix)) return;

    const url = message.content.match(/https:\/\/[^\s/$.?#].[^\s]*/);
    if (!url) return;

    const guessedOptions = guessDownloadOptions(message.content.slice(url.index! + url[0].length).trim());

    if (guessedOptions.unknowns.length > 3) config.deleteOriginal = false;

    const downloadOptions = {
      ...config.cobaltOptions,
      ...guessedOptions.options,
    };

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

    try {
      const result = await message.client.cobalt.download({ url: url[0], ...downloadOptions });

      if (result.status == "error") {
        if (result.error.code == "error.api.link.invalid") throw new InvalidUrlError(url[0]);
        throw new DownloadError(`Cobalt download error: ${result.error}`);
      }

      message.react(Constants.emojis.loading);

      const attachments = await download(result, {
        endTime,
        startTime,
        maxFileSize: maxFileSize(message.guild.premiumTier),
        extension: inferExtension({
          audioFormat: downloadOptions.audioFormat,
          downloadMode: downloadOptions.downloadMode,
          youtubeVideoContainer: downloadOptions.youtubeVideoContainer,
        }),
        audio: downloadOptions.downloadMode === "audio",
      });

      if (!attachments || !attachments.length) throw new DownloadError("No attachments returned from download function.");

      if (config.deleteOriginal) {
        await message.channel.send({
          content: `-# Downloaded ${attachments.length} file(s) from <${url[0]}>`,
          files: attachments,
        });
        await message.delete();
      } else {
        await message.reply({
          files: attachments,
        });
      }
    } catch (error) {
      handleErrors(message, error);
    }
  });
}
