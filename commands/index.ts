import Bot from "Bot";
import Command from "modules/command";
import download from "./download";
import help from "./help";
import ping from "./ping";
import prefix from "./prefix";
import random from "./random";
import services from "./services";

const commands: Command[] = [
  ping, // add your commands here
  prefix,
  random,
  services,
  download,
  help,
];

export default function setupCommands(bot: Bot) {
  commands.forEach((command) => bot.commands.set(command.data.name, command));
}
