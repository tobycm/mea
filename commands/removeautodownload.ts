import { GuildMember, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("removeautodownload").setDescription("Turn off autodownloading for this channel.");

export default new Command({
  data,
  guildOnly: true,
  async run(interaction) {
    let member = interaction.member;

    if (!(member instanceof GuildMember))
      member = interaction.guild.members.cache.get(interaction.author.id) || (await interaction.guild.members.fetch(interaction.author.id));

    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      interaction.reply({
        content: "Missing permission(s): `Manage Messages`",
        ephemeral: true,
      });
      return;
    }

    const message = await interaction.reply("Saving info...");

    await interaction.bot.db.ref("servers").child(interaction.guild.id).child("autodownload").child(interaction.channel.id).remove();

    message.edit({ content: `Autodownload settings removed for this channel!` });
  },
});
