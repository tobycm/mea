import Bot from "Bot";
import Command from "modules/command";
import autodownload from "./autodownload";
import download from "./download";
import ping from "./ping";
import prefix from "./prefix";
import removeautodownload from "./removeautodownload";
import services from "./services";

const commands: Command[] = [
  ping, // add your commands here
  prefix,
  autodownload,
  removeautodownload,
  services,
  download,
];

export default function setupCommands(bot: Bot) {
  commands.forEach((command) => bot.commands.set(command.data.name, command));
}
