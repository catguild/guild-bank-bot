import { Message, GuildMember } from "discord.js";
import { Account } from "../models/account";

export abstract class BaseCommand {

    public abstract readonly name: string;

    public abstract readonly description: string;

    public abstract action(message: Message, args: string[]): Promise<void>;

    public officerOnly = false;

    protected getAccount: () => Promise<Account>;

    protected getAccountOrNull: () => Promise<Account>;

    public async execute(message: Message, args: string[]): Promise<void> {
        try {
            this.getAccountOrNull = async () => await Account.findByDiscordId(message.guild.id);
            this.getAccount = async () => {
                const account = await this.getAccountOrNull();
                if (!account) {
                    message.reply("No guild bank configured on this discord server. Run `setGuild` or `setToken` to configure a classic guild bank account.")
                    throw new Error("Guild Bank not configured yet");
                }
                return account;
            }

            if ((await this.hasPermission(message.member)) === false) {
                message.reply("Sorry, permission denied. You need to be an officer to do this")
                return;
            }

            await this.action(message, args);
        } catch (e) {
            console.error(e);
            message.reply(`${e}`);
        }
    }

    private async hasPermission(member: GuildMember): Promise<boolean> {
        if (this.officerOnly === false) {
            return true;
        }
        return await this.hasMemberOfficerRole(member);
    }

    private async hasMemberOfficerRole(member: GuildMember): Promise<boolean> {
        const account = await this.getAccountOrNull();
        if (!account) {
            return true;
        }
        if (!account.officerRoles || account.officerRoles.length === 0) {
            return true;
        }
        const filtered = account.officerRoles.filter(or => member.roles.array().find(r => r.id === or.discordRoleId));
        return filtered.length > 0;
    }
}
