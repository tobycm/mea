import Bot from "Bot";
import { Events } from "discord.js";
import { ChatInputInteractionContext } from "modules/context";

export default (bot: Bot) => {
  bot.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.user.id === "542602170080428063") return; // back bling bling

    if (interaction.isButton()) return;

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command?.completion) return;

      return await command.completion(interaction);
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      const ctx = await ChatInputInteractionContext(interaction);

      await command.run(ctx);
    } catch (error) {
      console.error(error);

      try {
        if (interaction.replied || interaction.deferred) {
          interaction.editReply("An error occurred while executing this command.");
          return;
        }

        await interaction.reply("An error occurred while executing this command.");
      } catch (error) {
        /** dead dead */
      }
    }
  });
};
