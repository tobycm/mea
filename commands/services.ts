import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("services").setDescription("Get a list of supported services."),
  async run(interaction) {
    const hello = await interaction.bot.cobalt.hello();

    interaction.reply(`Supported services: ${hello.cobalt.services.join(", ")}`);
  },
});
