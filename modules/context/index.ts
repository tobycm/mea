import Bot from "Bot";
import {
  APIInteractionGuildMember,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  MessagePayload,
  MessageReplyOptions,
  SendableChannels,
  TextBasedChannel,
  User,
} from "discord.js";
import { getUserLang } from "modules/utils";

export interface BaseContext<GuildOnly extends boolean = false> {
  bot: Bot<true>;
  lang: Bot["lang"][keyof Bot["lang"]];
  channel: GuildOnly extends true ? GuildTextBasedChannel : TextBasedChannel | null;
  guild: GuildOnly extends true ? Guild : Guild | null;
  author: User;
  member: GuildOnly extends true ? GuildMember | APIInteractionGuildMember : GuildMember | APIInteractionGuildMember | null;

  original: Message | ChatInputCommandInteraction | InteractionResponse | ButtonInteraction;

  options?: ChatInputCommandInteraction["options"];

  send?(options: string | MessagePayload | MessageCreateOptions): Promise<BaseContext>;
  reply(options: string | MessageReplyOptions | InteractionReplyOptions): Promise<BaseContext>;
}

export interface MessageContext<GuildOnly extends boolean = false> extends BaseContext<GuildOnly> {
  original: Message;

  send?(options: string | MessagePayload | MessageCreateOptions): Promise<MessageContext>;
  reply(options: string | MessageReplyOptions): Promise<MessageContext>;
  edit(options: string | MessageEditOptions): Promise<MessageContext>;
}

export const MessageContext = async (message: Message<boolean>): Promise<MessageContext> => {
  const ctx: Omit<MessageContext, "lang"> = {
    bot: message.client as Bot<true>,
    channel: message.channel,
    guild: message.guild,
    author: message.author,
    member: message.member,
    original: message,
    send: message.channel.isSendable()
      ? async (options) => await MessageContext(await (message.channel as SendableChannels).send(options)) // ts stupid so had to cast it
      : undefined,
    reply: async (options) => await MessageContext(await message.reply(options)),
    edit: async (options) => await MessageContext(await message.edit(options)),
  };

  return {
    ...ctx,
    lang: await getUserLang(ctx),
  };
};

export interface ChatInputInteractionContext<GuildOnly extends boolean = false> extends BaseContext<GuildOnly> {
  original: ChatInputCommandInteraction;
  member: GuildOnly extends true ? GuildMember | APIInteractionGuildMember : GuildMember | APIInteractionGuildMember | null;
  options: ChatInputCommandInteraction["options"];

  send?(options: string | MessagePayload | MessageCreateOptions): Promise<MessageContext>;
  reply(options: string | InteractionReplyOptions): Promise<InteractionResponseContext>;
}

export const ChatInputInteractionContext = async (interaction: ChatInputCommandInteraction): Promise<ChatInputInteractionContext> => {
  const ctx: Omit<ChatInputInteractionContext, "lang"> = {
    bot: interaction.client as Bot<true>,
    channel: interaction.channel,
    guild: interaction.guild,
    author: interaction.user,
    member: interaction.member,
    original: interaction,
    options: interaction.options,
    send: interaction.channel?.isSendable()
      ? async (options) => await MessageContext(await (interaction.channel as SendableChannels).send(options))
      : undefined,
    reply: async (options) => await InteractionResponseContext(await interaction.reply(options)),
  };

  return {
    ...ctx,
    lang: await getUserLang(ctx),
  };
};

export interface InteractionResponseContext extends BaseContext {
  original: InteractionResponse<true>;

  send?(options: string | MessagePayload | MessageCreateOptions): Promise<MessageContext>;
  reply(options: string | MessageReplyOptions): Promise<MessageContext>;
  edit(options: string | MessageEditOptions): Promise<MessageContext>;
}

export const InteractionResponseContext = async (response: InteractionResponse<true>): Promise<InteractionResponseContext> => {
  const ctx: Omit<InteractionResponseContext, "lang"> = {
    bot: response.client as Bot<true>,
    channel: response.interaction.channel,
    guild: response.interaction.guild,
    author: response.interaction.user,
    member: response.interaction.member,
    original: response,
    send: response.interaction.channel ? async (options) => await MessageContext(await response.interaction.channel!.send(options)) : undefined,
    reply: async (options) => await MessageContext(await (await response.fetch()).reply(options)),
    edit: async (options) => await MessageContext(await response.edit(options)),
  };

  return {
    ...ctx,
    lang: await getUserLang(ctx),
  };
};

export interface ButtonInteractionContext extends BaseContext {
  original: ButtonInteraction;

  send?(options: string | MessagePayload | MessageCreateOptions): Promise<MessageContext>;
  reply(options: string | InteractionReplyOptions): Promise<InteractionResponseContext>;
}

export const ButtonInteractionContext = async (interaction: ButtonInteraction): Promise<ButtonInteractionContext> => {
  const ctx: Omit<ButtonInteractionContext, "lang"> = {
    bot: interaction.client as Bot<true>,
    author: interaction.user,
    channel: interaction.channel!,
    guild: interaction.guild,
    member: interaction.member as GuildMember | null,
    original: interaction,
    send: interaction.channel?.isSendable()
      ? async (options) => await MessageContext(await (interaction.channel as SendableChannels).send(options))
      : undefined,
    reply: async (options) => await InteractionResponseContext(await interaction.reply(options)),
  };
  return {
    ...ctx,
    lang: await getUserLang(ctx),
  };
};
