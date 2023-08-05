import { Command } from "@BotTemplate/types/Command";
import { CommandInteraction } from "discord.js";
import { LocaleResolver } from "@BotTemplate/locale/LocaleResolver.js";

export default class Ping implements Command {
	readonly name: string = "ping";
	readonly guildOnly: boolean = true;

	async execute(interaction: CommandInteraction, locale: LocaleResolver): Promise<void> {
		await interaction.reply(await locale.resolve("text", { ping: `${bot.client.ws.ping}`, timestamp: `${interaction.createdTimestamp - Date.now()}` }));
	}
}