import * as Discord from "discord.js";
import { Message } from "discord.js";
import { ApiRequest } from "../api/guild-bank.api";
import { Account } from "../models/account";
import { BaseCommand } from "./base.command";

export class InventoryCommand extends BaseCommand {

    public name = 'inventory';

    public description = 'Get complete guild bank inventory report';

    public async action(message: Message, args: string[]) {
        const account = await this.getAccount();
        const items = await new ApiRequest().forAccount(account).getItems();
        const chunk = 25;
        let parts = 1;
        for (let i = 0; i < items.length; i += chunk) {
            const responseMsg = new Discord.RichEmbed().setTitle(`Guild Bank Inventory - Part #${parts}`);
            const tmpResponse = items.slice(i, i + chunk);
            tmpResponse.forEach((res) => responseMsg.addField(res[0].name, `${res[0].quantity} x`, true));
            await message.author.send(responseMsg);
            parts++;
        }
        await message.delete();
    }
};
