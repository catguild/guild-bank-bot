import * as Discord from "discord.js";
import { Message } from "discord.js";
import { ApiRequest } from "../api/guild-bank.api";
import { Account } from "../models/account";
import { prefix } from "../util/constants";
import { BaseCommand } from "./base.command";

export class ImportCommand extends BaseCommand {

    public readonly name = "import";

    public description = "Upload inventory import string to Classic Guild Bank";

    public usage = `${prefix}${this.name} PASTED_IMPORT_STRING`

    public async action(message: Message, args: string[]) {
      console.log(`in import with args ${args}`);
      const importString = args[0];
      const decodedArray = atob(importString).split(";");
      const characterName = decodedArray[0].match(/(\w+)/)[0];
      const numSlots = decodedArray.length - 3; // 0 is charname, 1 is list of bags, -1 is empty string
      console.log(`for character ${characterName} with ${numSlots}`);

      const account = await this.getAccount();
      const result = await new ApiRequest().forAccount(account).postImportString(importString);

      await message.channel.send(`Imported ${characterName}: ${numSlots} inventory slots.`);
    }
}


