import { inlineCode, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder()
  .setName("prefix")
  .setDescription("Set a custom prefix for the bot.")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

data.addStringOption((option) => option.setName("prefix").setDescription("The new prefix for this server"));

export default new Command({
  data,
  guildOnly: true,

  run(interaction) {
    const prefix = interaction.options.getString("prefix");

    if (!prefix) {
      interaction.bot.db.ref("servers").child(interaction.guild.id).child("prefix").remove();

      interaction.reply(interaction.lang.commands.prefix.reset);
      return;
    }

    interaction.bot.db.ref("servers").child(interaction.guild.id).child("prefix").set(prefix);

    interaction.reply(interaction.lang.commands.prefix.set.replaceAll("%%prefix%%", inlineCode(prefix)));
  },
});
