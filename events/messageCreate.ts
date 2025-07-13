import Bot from "Bot";
import { Events, userMention } from "discord.js";

const admins = process.env.ADMINS?.split(",") || [];

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const mention = userMention(message.client.user.id);

    if (!message.content.startsWith(mention)) return;

    const [commandName, ...args] = message.content.slice(mention.length, message.content.length).trim().split(" ");

    if (commandName === "deploy") {
      if (!admins.includes(message.author.id)) return;

      const commands = Array.from(message.client.commands.values());

      try {
        await bot.application?.commands.set(commands.map((command) => command.data));
        await message.reply("Deployed commands.");
        console.log("Deployed commands requested by", message.author.displayName);
      } catch (error) {
        console.error("Failed to deploy commands requested by", message.author.displayName, "with error:", error);
        await message.reply("Failed to deploy commands.");
      }
    }
    if (commandName === "test") {
    }
  });
}
