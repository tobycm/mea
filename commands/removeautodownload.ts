import { SlashCommandBuilder } from "discord.js";
import { DownloadOptions } from "modules/cobalt/request";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("removeautodownload").setDescription("Turn off autodownloading for this channel.");

export default new Command({
  data,
  guildOnly: true,
  async run(ctx) {
    const message = await ctx.reply("Saving info...");

    await ctx.bot.db.ref("servers").child(ctx.guild.id).child("autodownload").child(ctx.channel.id).remove();
    
    message.edit({ content: `Autodownload settings saved for this channel!` });
  },
});
