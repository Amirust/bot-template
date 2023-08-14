import { CommandInteraction, PermissionsString } from "discord.js";
import { LocaleResolver } from "@BotTemplate/locale/LocaleResolver";

export interface Command {
	readonly name: string;
	readonly parentOf?: string;
	readonly permissions?: PermissionsString[];
	readonly botPermissions?: PermissionsString[];
	readonly guildOnly: boolean;

	execute(interaction: CommandInteraction, locale: LocaleResolver): Promise<void>;
	executeAutoComplete?(interaction: CommandInteraction, locale: LocaleResolver): Promise<void>;
}