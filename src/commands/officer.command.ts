import { Message } from "discord.js";
import { prefix } from "../util/constants";
import { BaseCommand } from "./base.command";
import { Role } from "../models/role";

export class OfficerCommand extends BaseCommand {

    public name = "officer";

    public description = `Add a officer to use the guild bank bot: \`${prefix}officer @YOUR_OFFICER_ROLE\``;

    public officerOnly = true;

    async action(message: Message, args: string[]) {
        const roleTag = args[0];
        if (!roleTag) {
            await message.reply("No role provided, please provide a valid role: `${prefix}officer YOUR_OFFICER_ROLE`");
            return;
        }

        const roleId = roleTag.match(/\d/g).join("");
        const discordRole = message.guild.roles.find("id", roleId)

        if (!discordRole) {
            await message.reply(`Role not found on your discord server, please provide a valid role`);
            return;
        }

        const account = await this.getAccount();

        const officerRole = new Role();
        officerRole.account = account;
        officerRole.discordRoleId = discordRole.id;
        if (!account.officerRoles) {
            account.officerRoles = [officerRole];
        }
        officerRole.save();

        await account.save();
        await message.channel.send("Officer added!");
    }
};
