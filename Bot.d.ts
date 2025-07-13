import { AceBase } from "acebase";
import { AceBaseClient } from "acebase-client";
import { CobaltAPI } from "modules/cobalt";
import Command from "modules/command";
import langs from "./lang/index";

declare module "discord.js" {
  export interface Client {
    commands: Map<string, Command>;

    lang: typeof langs;

    db: AceBase | AceBaseClient;

    cobalt: CobaltAPI;
  }
}
