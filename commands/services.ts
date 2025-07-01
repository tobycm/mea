import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("services").setDescription("Get a list of supported services."),
  async run(ctx) {
    const hello = await ctx.bot.cobalt.hello();

    ctx.reply(`Supported services: ${hello.cobalt.services.join(", ")}`);
  },
});
