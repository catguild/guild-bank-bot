import * as Discord from "discord.js";
import { Message } from "discord.js";
import { ApiRequest } from "../api/guild-bank.api";
import { Account } from "../models/account";
import { prefix } from "../util/constants";
import { BaseCommand } from "./base.command";
import { atob } from "atob";
import * as axios from "axios";

export class ImportCommand extends BaseCommand {

    public readonly name = "import";

    public description = "Upload inventory import string to Classic Guild Bank";

    public usage = `${prefix}${this.name} PASTED_IMPORT_STRING`

    public async action(message: Message, args: string[]) {
      try {
        console.log('MESSAGE ATTACHMENT:');
        console.log(message.attachments);
        console.log('wwwwwwwwwwwwwww the first ones url is...');
        console.log(message.attachments.first().url);
        let importString = args[0];
        if (args.length == 0) {
          console.log('DDDDDDDDDDDDDDDDD empty string found, look at url here')
          const attachmentUrl = message.attachments.first().url;
          // let file = message.attachments.first().file;
          // fs.readFile(file, (err, data) => {
          //   importString = data;
          // })
          let attachmentResponse = await axios.get(attachmentUrl);
          console.log('GOT IMPORT STRING XXXXXXXXXXXXX');
          console.log(attachmentResponse);
          importString = attachmentResponse.body;
        }
        const decodedArray = atob(importString).split(";");
        const characterName = decodedArray[0].match(/(\w+)/)[0];
        const numSlots = decodedArray.length - 3; // 0 is charname, 1 is list of bags, -1 is empty string
        console.log(`about to import character ${characterName} with ${numSlots} slots`);

        const account = await this.getAccount();
        const result = await new ApiRequest().forAccount(account).postImportString(importString);

        await message.channel.send(`Imported ${characterName}: ${numSlots} inventory slots.`);
      } catch(error) {
        console.error(error);
        await message.channel.send(`Error! ${error}`);
      }
    }
}


