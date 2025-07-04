import { AceBase } from "acebase";
import { AceBaseClient, AceBaseClientConnectionSettings } from "acebase-client";
import { Client, type ClientOptions } from "discord.js";
import Cache from "modules/cache";
import { CobaltAPI } from "modules/cobalt";
import Command from "modules/command";
import langs from "./lang/index";

interface AceBaseLocalOptions {
  type: "local";
  databaseName: string;
}

interface AceBaseClientOptions extends AceBaseClientConnectionSettings {
  type: "client";
}

interface CacheOptions {
  lifespan: number;
}

interface CobaltOptions {
  url: string;
  apiKey?: string;
}

interface BotOptions {
  discord: ClientOptions;
  acebase: AceBaseLocalOptions | AceBaseClientOptions;
  cache?: CacheOptions;

  cobalt: CobaltOptions;
}

export default class Bot<Ready extends boolean = boolean> extends Client<Ready> {
  constructor(options: BotOptions) {
    super(options.discord);

    if (options.acebase.type === "local") this.db = new AceBase(options.acebase.databaseName, { storage: { removeVoidProperties: true } });
    else if (options.acebase.type === "client") this.db = new AceBaseClient(options.acebase);
    else this.db = new AceBase("bot");

    if (!options.cache) options.cache = { lifespan: 60000 };
    this.cache = new Cache(options.cache.lifespan);

    this.cobalt = new CobaltAPI(options.cobalt.url, options.cobalt.apiKey);
  }

  commands = new Map<string, Command>();

  lang = langs;

  cache: Cache<string, any>;

  db: AceBase | AceBaseClient;

  cobalt: CobaltAPI;
}
