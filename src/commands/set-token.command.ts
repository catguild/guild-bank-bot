import { Message } from "discord.js";
import { Account } from "../models/account";
import { ApiRequest } from "../api/guild-bank.api";
import { BaseCommand } from "./base.command";

export class SetTokenCommand extends BaseCommand {

    public name = 'setToken';

    public description = 'Setup a private classic guild bank account: `${prefix}setToken API_TOKEN`';
    
    public officerOnly = true;

    public async action(message: Message, args: string[]) {
        const token = args[0];
        const guildId = await getGuildIdByToken(token);
        if (!guildId) {
            await message.reply("Cannot get Guild Id, please provide a valid token!");
            return;
        }
        const account = new Account();
        account.discordGuildId = message.guild.id;
        account.classicGuildBankId = guildId;
        account.apiToken = token;
        account.isPublic = false;

        await account.save();
        await message.delete();
        await message.channel.send("Guild Bank configured: type `${prefix}help` to see list of commands.\nHappy raiding :)");
    }
};


const getGuildIdByToken = async (apiToken: string) => {
    return new ApiRequest().withToken(apiToken).getGuildId();
}
