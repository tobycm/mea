import Bot from "Bot";
import autoChannelDownload from "./autoChannelDownload";
import ready from "./clientReady";
import dbReady from "./dbReady";
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";

const botEvents: ((bot: Bot) => void)[] = [
  ready, //
  messageCreate,
  interactionCreate,
  autoChannelDownload,
];

const databaseEvents: ((db: Bot["db"]) => void)[] = [
  dbReady, //
];

export function setupBotEvents(bot: Bot) {
  botEvents.forEach((event) => event(bot));
}

export function setupDatabaseEvents(db: Bot["db"]) {
  databaseEvents.forEach((event) => event(db));
}
