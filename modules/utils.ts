import Bot from "Bot";
import { exec } from "child_process";
import { ApplicationCommandOptionBase, ApplicationCommandOptionType, GuildMember, GuildPremiumTier, PermissionFlagsBits } from "discord.js";
import { createReadStream, mkdirSync } from "fs";
import { rm, stat } from "fs/promises";
import path from "path";
import Command from "./command";
import { BaseContext } from "./context";

export type Perm = keyof typeof PermissionFlagsBits;

export const intToBitField = (int: bigint): Perm[] => (Object.keys(PermissionFlagsBits) as Perm[]).filter((perm) => int & PermissionFlagsBits[perm]);

export const checkPermissions = (member: GuildMember, permissions: bigint): Perm[] =>
  intToBitField(permissions).filter((perm) => !member.permissions.has(perm));

type ValueOf<T> = T[keyof T];

function getEnumKeyFromValue<R extends string | number, T extends { [key: string]: R }>(myEnum: T, enumValue: ValueOf<T>): string {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : "";
}

export function commandUsage(command: Command): string {
  const options = command.data.options as ApplicationCommandOptionBase[];

  const args: string[] = [];

  for (const option of options) {
    const type = getEnumKeyFromValue(ApplicationCommandOptionType, option.type) as keyof typeof ApplicationCommandOptionType;

    if (type === "Subcommand" || type === "SubcommandGroup") {
      // not supported
      continue;
    }

    const name = option.name;

    let wrappers = ["[", "]"]; // optional
    if (option.required) wrappers = ["<", ">"]; // required

    args.push(`${wrappers[0]}${name}: ${type}${wrappers[1]}`);
  }

  return args.join(" ");
}

export function parseIdFromUserMention(mention: string): string {
  if (!mention.startsWith("<@") || !mention.endsWith(">")) return "";

  mention = mention.slice(2, -1);

  if (mention.startsWith("!")) mention = mention.slice(1);

  return mention;
}

export async function getUserLang(ctx: Omit<BaseContext, "lang">): Promise<Bot["lang"][keyof Bot["lang"]]> {
  const user = (await ctx.bot.db.ref("users").child(ctx.author.id).child("lang").get<keyof Bot["lang"]>()).val();

  if (!user) return ctx.bot.lang["en-us"];

  return ctx.bot.lang[user];
}

export function milliseconds(ms: number = 0, seconds: number = 0, minutes: number = 0, hours: number = 0, days: number = 0) {
  return ms + seconds * 1000 + minutes * 60000 + hours * 3600000 + days * 86400000;
}

const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];

export function niceBytes(x: number) {
  let l = 0;

  while (x >= 1024 && ++l) {
    x = x / 1024;
  }

  return x.toFixed(x < 10 && l > 0 ? 1 : 0) + " " + units[l];
}

export function maxFileSize(tier?: GuildPremiumTier) {
  if (tier === GuildPremiumTier.Tier3) return 100 * 1024 * 1024; // 100 MB
  if (tier === GuildPremiumTier.Tier2) return 50 * 1024 * 1024; // 50 MB
  return 10 * 1024 * 1024; // 10 MB
}

export const timeRegex: RegExp = /(\d{1,2})?:?(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?/g;

interface FFMpegOptions {
  input: string;
  filename: string;
  startTime?: string;
  endTime?: string;
}

export interface MediaFile {
  byteLength: number;
  stream: NodeJS.ReadableStream;
  path: string;
}

export async function ffmpegDownload(options: FFMpegOptions): Promise<MediaFile> {
  const { input, filename, startTime, endTime } = options;

  mkdirSync("temp", { recursive: true });

  const filePath = path.join("temp", filename);

  await new Promise((resolve, reject) => {
    const args: string[] = ["-i", `"${input}"`];

    if (startTime) args.push("-ss", startTime);
    if (endTime) args.push("-to", endTime);

    args.push(`"${filePath}"`);

    exec(`ffmpeg ${args.join(" ")}`, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
    // .stderr?.on("data", (data) => {
    //   console.log(`FFmpeg stderr: ${data}`);
    // });
  });

  const stats = await stat(filePath);

  const stream = createReadStream(filePath);

  stream.on("end", () => rm(filePath, { force: true }));

  const mediaFile: MediaFile = {
    byteLength: stats.size,
    stream,
    path: filePath,
  };

  return mediaFile;
}
