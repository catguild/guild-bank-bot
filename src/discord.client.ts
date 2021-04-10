// @ts-nocheck
import * as Discord from "discord.js";
import {getAllCommands} from "./util/command-helper";
import {Account} from "./models/account";
import {prefix} from "./util/constants";

export const createDiscordClient = async () => {
    const client = new Discord.Client();
    client.commands = new Discord.Collection();
    getAllCommands().forEach(c => client.commands.set(c.name.toLowerCase(), c));

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`)
    });

    client.on("guildCreate", async (guild: Account) => {
        await guild.owner.send('Thanks! You can use `' + prefix + ' help` to discover commands.');
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    });

    client.on("message", async msg => {
        if (!msg.content.startsWith(prefix) || msg.author.bot) {
            return;
        }
        const args: string[] = msg.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
        try {
            if (await client.commands.has(command)) {
                const commandHandler = client.commands.get(command);
                console.log(`Execute: ${commandHandler.name} with args "${args}"`);
                await commandHandler.execute(msg, args);
            } else if (args) {
                console.log(`No command, using search.`);
                client.commands.get("search").execute(msg, args);
            } else {
                console.log(`Command: ${command} not found, display help.`);
                client.commands.get("help").execute(msg, args);
            }
        } catch (error) {
            console.error(error);
            await msg.reply('there was an error trying to execute that command!');
        }
    });

    await client.login(process.env.DISCORD_TOKEN);
};
