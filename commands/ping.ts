import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with the bot gateway latency."),
  run(interaction) {
    interaction.reply({ content: interaction.lang.commands.ping.replaceAll("%%latency%%", `${interaction.bot.ws.ping}`), ephemeral: true });
  },
});
