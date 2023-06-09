import { CommandInteraction } from "discord.js";
import { LocaleResolver } from "@BotTemplate/locale/LocaleResolver.js";

export interface Command {
	readonly name: string;
	readonly parentOf?: string;
	readonly permissions?: string[];
	readonly guildOnly: boolean;

	execute(interaction: CommandInteraction, locale: LocaleResolver): Promise<void>;
	executeAutoComplete?(interaction: CommandInteraction, locale: LocaleResolver): Promise<void>;
}