import Bot from "Bot";
import { Events } from "discord.js";

export default (bot: Bot) => {
  bot.on(Events.ClientReady, async (client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    try {
      const cobaltInfo = await bot.cobalt.hello();

      console.log("Connected to Cobalt API, on version:", cobaltInfo.git.branch, cobaltInfo.git.commit.slice(0, 7));
    } catch (error) {
      console.error("Failed to connect to Cobalt API:", error);
    }
  });
};
