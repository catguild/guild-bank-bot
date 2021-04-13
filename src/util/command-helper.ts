import { BaseCommand } from "../commands/base.command";
import { GoldCommand } from "../commands/gold.command";
import { HelpCommand } from "../commands/help.command";
import { InventoryCommand } from "../commands/inventory.command";
import { OfficerCommand } from "../commands/officer.command";
import { SearchCommand } from "../commands/search.command";
import { SetGuildCommand } from "../commands/set-guild.command";
import { SetTokenCommand } from "../commands/set-token.command";
import { VersionCommand } from "../commands/version.command";
import { ImportCommand } from "../commands/import.command";

export const getAllCommands = (): BaseCommand[] => {
    const allCommands = [
        new GoldCommand(),
        new HelpCommand(),
        new InventoryCommand(),
        new OfficerCommand(),
        new SearchCommand(),
        new SetGuildCommand(),
        new SetTokenCommand(),
        new VersionCommand(),
        new ImportCommand(),
    ]
    return allCommands;
}