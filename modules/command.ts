import { AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { ChatInputInteractionContext } from "./context";

interface CommandOptions<GuildOnly extends boolean = false> {
  data: SlashCommandBuilder;
  guildOnly?: GuildOnly;

  run: (context: ChatInputInteractionContext<GuildOnly>) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}

export default class Command<GuildOnly extends boolean = boolean> {
  constructor(options: CommandOptions<GuildOnly>) {
    this.data = options.data;
    this.guildOnly = (options.guildOnly ?? false) as GuildOnly;

    this.run = options.run;
    this.completion = options.completion;
  }

  data: SlashCommandBuilder;
  guildOnly: GuildOnly;

  run: (context: ChatInputInteractionContext<GuildOnly>) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}
